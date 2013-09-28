define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/on",
    "dojo/date/locale",
    "esri/InfoTemplate",
    "esri/layers/FeatureLayer",
    "esri/geometry/mathUtils",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Point",
    "esri/request",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol"
],
function (
    declare, array, lang,
    Stateful, Evented, on,
    locale,
    InfoTemplate,
    FeatureLayer,
    mathUtils,
    webMercatorUtils,
    Point,
    esriRequest,
    Graphic,
    PictureMarkerSymbol
) {
    return declare("modules.Flickr", [Stateful, Evented], {
        options: {
            map: null,
            filterUsers: [],
            filterWords: [],
            autopage: true,
            visible: true,
            maxpage: 1,
            limit: 100,
            title: 'Flickr',
            id: 'flickr',
            datePattern: "MMM d, yyyy",
            timePattern: "h:mma",
            searchTerm: '',
            minScale: 1200000,
            maxScale: null,
            symbol: null,
            infoTemplate: null,
            dateFrom: '',
            dateTo: '',
            key: '',
            refreshTime: 4000
        },
        constructor: function (options) {
            // mixin options
            declare.safeMixin(this.options, options);
            // properties
            this.set("map", this.options.map);
            this.set("filterUsers", this.options.filterUsers);
            this.set("filterWords", this.options.filterWords);
            this.set("autopage", this.options.autopage);
            this.set("visible", this.options.visible);
            this.set("maxpage", this.options.maxpage);
            this.set("limit", this.options.limit);
            this.set("title", this.options.title);
            this.set("id", this.options.id);
            this.set("datePattern", this.options.datePattern);
            this.set("timePattern", this.options.timePattern);
            this.set("searchTerm", this.options.searchTerm);
            this.set("symbol", this.options.symbol);
            this.set("infoTemplate", this.options.infoTemplate);
            this.set("dateFrom", this.options.dateFrom);
            this.set("dateTo", this.options.dateTo);
            this.set("key", this.options.key);
            this.set("minScale", this.options.minScale);
            this.set("maxScale", this.options.maxScale);
            this.set("graphics", []);
            this.set("noGeo", []);
            // listeners
            this.watch("searchTerm", this.update);
            this.watch("visible", this._visible);
            // private vars
            this._deferreds = [];
            this._events = [];
            this._dataIds = {};
            // classes
            this._css = {
                container: "flickr-popup",
                imageAnchor: "image-anchor",
                image: "image",
                title: "title",
                ownername: "ownername",
                ownerAnchor: "owner-anchor",
                content: "content",
                date: "date"
            };
            // map required
            if (!this.map) {
                console.log('Flickr::Reference to esri.Map object required');
                return;
            }
            // api url
            if (location.protocol === "https:") {
                this.set("baseurl", "https://secure.flickr.com/services/rest/");
            } else {
                this.set("baseurl", "http://api.flickr.com/services/rest/");
            }
            // default symbol
            if (!this.symbol) {
                this.set("symbol", new PictureMarkerSymbol('images/map/flickr25x30.png', 25, 30));
            }
            // default infoTemplate
            if (!this.infoTemplate) {
                this.set("infoTemplate", new InfoTemplate('Flickr', '<div class="' + this._css.container + '"><a tabindex="0" class="' + this._css.imageAnchor + '" href="${location.protocol}//www.flickr.com/photos/${owner}/${id}/in/photostream" target="_blank"><img class="' + this._css.image + '" width="${width_s}" height="${height_s}" src="${url_s}"></a><div class="' + this._css.title + '">${title}</div><div class="' + this._css.ownername + '"><a tabindex="0" href="${location.protocol}//www.flickr.com/photos/${owner}/" target="_blank">${ownername}</a></div><div class="' + this._css.content + '">${description._content}</div><div class="' + this._css.date + '">${dateformatted}</div></div>'));
            }
            // layer
            this.featureCollection = {
                layerDefinition: {
                    "geometryType": "esriGeometryPoint",
                    "drawingInfo": {
                        "renderer": {
                            "type": "simple",
                            "symbol": this.symbol
                        }
                    },
                    "fields": [{
                        "name": "OBJECTID",
                        "type": "esriFieldTypeOID"
                    }],
                    "globalIdField": "id",
                    "displayField": "title"
                },
                featureSet: {
                    "features": [],
                    "geometryType": "esriGeometryPoint"
                }
            };
            // layer
            this.featureLayer = new FeatureLayer(this.featureCollection, {
                id: this.id,
                title: this.title,
                minScale: this.minScale,
                maxScale: this.maxScale,
                outFields: ["*"],
                infoTemplate: this.infoTemplate,
                visible: this.visible
            });
            // add to map
            this.map.addLayer(this.featureLayer);
            // Events
            var extentChange = on(this.map, "extent-change", lang.hitch(this, function () {
                this.update();
            }));
            this._events.push(extentChange);
            // query when map loads
            if(this.map.loaded){
                this.update();
            }
            else{
                var onLoad = on.once(this.map, "load", lang.hitch(this, function () {
                    this.update();
                }));
                this._events.push(onLoad);
            }
            // loaded
            this.set("loaded", true);
            this.emit("load", {});
        },
        destroy: function(){
            // remove events
            if (this._events && this._events.length) {
                for (var i = 0; i < this._events.length; i++) {
                    this._events[i].remove();
                }
            }
            // clear data
            this.clear();
            // remove layer
            this.map.removeLayer(this.featureLayer);
        },
        update: function () {
            if(this.featureLayer && this.featureLayer.visible){
                if(this._refreshTimer){
                    clearTimeout(this._refreshTimer);
                }
                this._refreshTimer = setTimeout(lang.hitch(this, function() {
                    this.constructQuery();
                }), this.refreshTime);
            }
        },
        clear: function () {
            // remove timer
            if(this._refreshTimer){
                clearTimeout(this._refreshTimer);
            }
            // cancel any outstanding requests
            this.query = null;
            array.forEach(this._deferreds, function (def) {
                def.cancel();
            });
            this._deferreds = [];
            if (this.featureLayer.graphics.length > 0) {
                this.featureLayer.applyEdits(null, null, this.featureLayer.graphics);
            }
            this.set("graphics", []);
            this._dataIds = {};
            this.emit("clear", {});
        },
        show: function () {
            this.featureLayer.setVisibility(true);
        },
        hide: function () {
            this.featureLayer.setVisibility(false);
        },
        setVisibility: function (val) {
            if (val) {
                this.show();
            } else {
                this.hide();
            }
        },
        // Format Date Object
        formatDate: function (dateObj) {
            if (dateObj) {
                return locale.format(dateObj, {
                    datePattern: this.timePattern,
                    selector: "date"
                }).toLowerCase() + ' &middot; ' + locale.format(dateObj, {
                    datePattern: this.datePattern,
                    selector: "date"
                });
            }
        },
        getRadius: function () {
            var map = this.map;
            var extent = this.map.extent;
            var center = extent.getCenter();
            this.maxRadius = 600;
            var radius = Math.min(this.maxRadius, Math.ceil(mathUtils.getLength(Point(extent.xmin, extent.ymin, map.spatialReference), Point(extent.xmax, extent.ymin, map.spatialReference)) * 3.281 / 5280 / 2));
            var dist = (radius) / 2;
            dist = dist * 10;
            dist = (dist * 160.934).toFixed(3);
            dist = parseFloat(dist);
            var minPoint, maxPoint;
            var geoPoint = Point(center.x, center.y, map.spatialReference);
            minPoint = webMercatorUtils.webMercatorToGeographic(Point(geoPoint.x - dist, geoPoint.y - dist, map.spatialReference));
            maxPoint = webMercatorUtils.webMercatorToGeographic(Point(geoPoint.x + dist, geoPoint.y + dist, map.spatialReference));
            return {
                minPoint: minPoint,
                maxPoint: maxPoint
            };
        },
        constructQuery: function () {
            var search = lang.trim(this.searchTerm);
            if (search.length === 0) {
                search = "";
            }
            var radius = this.getRadius();
            this.query = {
                bbox: radius.minPoint.x + "," + radius.minPoint.y + "," + radius.maxPoint.x + "," + radius.maxPoint.y,
                extras: "description, date_upload, owner_name, geo, url_s",
                per_page: this.limit,
                sort: 'date-posted-desc',
                safe_search: 2,
                content_type: 1,
                tags: search,
                method: "flickr.photos.search",
                api_key: this.key,
                has_geo: 1,
                page: 1,
                format: "json"
            };
            if (this.dateTo && this.dateFrom) {
                this.query.max_taken_date = Math.round(this.dateTo / 1000);
                this.query.min_taken_date = Math.round(this.dateFrom / 1000);
            }
            // make the actual Flickr API call
            this.pageCount = 1;
            this.sendRequest(this.baseurl, this.query);
        },
        sendRequest: function (url, content) {
            // get the results from Flickr for each page
            var deferred = esriRequest({
                url: url,
                handleAs: "json",
                timeout: 8000,
                content: content,
                callbackParamName: "jsoncallback",
                preventCache: true,
                load: lang.hitch(this, function (data) {
                    if (data.stat !== 'fail') {
                        if (data.photos.photo.length > 0) {
                            this.mapResults(data);
                            // display results for multiple pages
                            if ((this.autopage) && (this.maxpage > this.pageCount) && (data.photos.page < data.photos.pages) && (this.query)) {
                                this.pageCount++;
                                this.query.page++;
                                this.sendRequest(this.baseurl, this.query);
                            } else {
                                this._updateEnd();
                            }
                        } else {
                            // No results found, try another search term
                            this._updateEnd();
                        }
                    } else {
                        if (data.code === 100) {
                            console.log('Flickr::' + data.code + ' - ' + this.title + ': ' + data.message);
                        }
                        // No results found, try another search term
                        this._updateEnd();
                    }
                }),
                error: lang.hitch(this, function (e) {
                    if (deferred.canceled) {
                        console.log('Flickr::Search Cancelled');
                    } else {
                        console.log('Flickr::Search error' + ": " + e.message.toString());
                    }
                    this._error(e);
                })
            });
            this._deferreds.push(deferred);
        },
		findWordInText: function (word, text) {
            if(word && text) {
                // text
                var searchString = text.toLowerCase();
                // word
                var badWord = ' ' + word.toLowerCase() + ' ';
                // if found
                if(searchString.indexOf(badWord) > -1) {
                    return true;
                }
            }
            return false;
        },
        mapResults: function (j) {
            if (j.error) {
                console.log("Flickr::mapResults error: " + j.error);
                this._error(j.error);
                return;
            }
            var b = [];
            var c = [];
            var k = j.photos.photo;
            array.forEach(k, lang.hitch(this, function (result) {
                // add social media type/id for filtering
                result.smType = this.id;
                result.filterType = 4;
                result.filterContent = 'http://www.flickr.com/photos/' + result.owner + '/' + result.id + '/in/photostream';
                result.filterAuthor = result.owner;
                // add date to result
                var date = new Date(parseInt(result.dateupload * 1000, 10));
                result.dateformatted = this.formatDate(date);
                // add location protocol to result
                result.location = location;
                // eliminate geo photos which we already have on the map
                if (this._dataIds[result.id]) {
                    return;
                }
				// filter variable
				var filter = false, i;
				// check for filterd user
				if(this.filterUsers && this.filterUsers.length){
					for(i = 0; i < this.filterUsers.length; i++){
						if(this.filterUsers[i].toString() === result.owner.toString()){
							filter = true;
							break;
						}
					}
				}
				// check if contains bad word
				if(!filter && this.filterWords && this.filterWords.length){
					for(i = 0; i < this.filterWords.length; i++){
						if(this.findWordInText(this.filterWords[i], result.title)){
							filter = true;
							break;
						}
						if(this.findWordInText( this.filterWords[i], result.description._content)){
							filter = true;
							break;
						}
					}
				}
				// if this feature needs to be filtered
				if(filter){
					return;
				}
                this._dataIds[result.id] = true;
                var geoPoint = null;
                if (result.latitude) {
                    var g = [result.latitude, result.longitude];
                    geoPoint = Point(parseFloat(g[1]), parseFloat(g[0]));
                }
                if (geoPoint && geoPoint.hasOwnProperty('x') && geoPoint.hasOwnProperty('y')) {
                    // convert the Point to WebMercator projection
                    var a = webMercatorUtils.geographicToWebMercator(geoPoint);
                    // make the Point into a Graphic
                    var graphic = new Graphic(a, this.symbol, result, this.infoTemplate);
                    b.push(graphic);
                }
                else{
                    c.push(result);
                }
            }));
            // add new graphics to widget
            var graphics = this.get("graphics");
            graphics.concat(b);
            this.set("graphics", graphics);
            // add non geocode results to noGeo
            var noGeo = this.get("noGeo");
            noGeo.concat(c);
            this.set("noGeo", noGeo);
            // add new graphics to layer
            this.featureLayer.applyEdits(b, null, null);
            // update event with new graphics
            this.emit("update", {
                graphics: b,
                noGeo: c
            });
        },
        _visible: function() {
            this.setVisibility(this.get("visible"));
        },
        _error: function(e){
            this._updateEnd();
            this.emit("error", e);
        },
        _updateEnd: function () {
            this.query = null;
            this.emit("update-end", {});
        }
    });
});