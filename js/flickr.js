define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/dom-geometry",
    "dojo/io-query",
    "dojo/date/locale",
    "esri/InfoTemplate",
    "esri/layers/FeatureLayer",
    "esri/tasks/QueryTask",
    "esri/geometry/Extent",
    "esri/geometry/mathUtils",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Point",
    "esri/request",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "dojo/on"
],
function (declare, arr, lang, event, domGeom, ioQuery, locale, InfoTemplate, FeatureLayer, QueryTask, Extent, mathUtils, webMercatorUtils, Point, esriRequest, Graphic, PictureMarkerSymbol, on) {
    var Widget = declare("modules.Flickr", null, {
        constructor: function (options) {
            this.options = {
                filterUsers: [],
                filterWords: [],
                autopage: true,
                visible: true,
                maxpage: 2,
                limit: 100,
                title: 'Flickr',
                id: 'flickr',
                datePattern: "MMM d, yyyy",
                timePattern: "h:mma",
                searchTerm: '',
                symbol: new PictureMarkerSymbol('images/map/flickr25x30.png', 18.75, 22.5),
                infoTemplate: new InfoTemplate('Flickr', '<div class="flContent"><a tabindex="0" class="flImgA" href="${location.protocol}//www.flickr.com/photos/${owner}/${id}/in/photostream" target="_blank"><img width="${width_s}" height="${height_s}" src="${url_s}"></a><div class="title">${title}</div><div class="username"><a tabindex="0" href="${location.protocol}//www.flickr.com/photos/${owner}/" target="_blank">${ownername}</a></div><div class="content">${description._content}</div><div class="date">${dateformatted}</div></div>'),
                dateFrom: '',
                dateTo: '',
                apiKey: ''
            };
            lang.mixin(this.options, options);
            
            
            if (this.options.map === null) {
                throw 'Reference to esri.Map object required';
            }
            if (location.protocol === "https:") {
                this.baseurl = "https://secure.flickr.com/services/rest/";
            } else {
                this.baseurl = "http://api.flickr.com/services/rest/";
            }
            
            this.featureCollection = {
                layerDefinition: {
                    "geometryType": "esriGeometryPoint",
                    "drawingInfo": {
                        "renderer": {
                            "type": "simple",
                            "symbol": {
                                "type": "esriPMS",
                                "url": this.options.symbol.url,
                                "contentType": "image/" + this.options.symbol.url.substring(this.options.symbol.url.lastIndexOf(".") + 1),
                                "width": this.options.symbol.width,
                                "height": this.options.symbol.height
                            }
                        }
                    },
                    "fields": [],
                    "globalIdField": "id",
                    "displayField": "title"
                },
                featureSet: {
                    "features": [],
                    "geometryType": "esriGeometryPoint"
                }
            };

            
            this.featureLayer = new FeatureLayer(this.featureCollection, {
                id: this.options.id,
                title: this.options.title,
                outFields: ["*"],
                infoTemplate: this.options.infoTemplate,
                visible: this.options.visible
            });
            this.options.map.addLayer(this.featureLayer);
            
            
            on(this.options.map, "extent-change", lang.hitch(this, function () {
                this.update();
            }));
            


            this.dataPoints = [];
            this.deferreds = [];
            this.geocoded_ids = {};
            this.loaded = true;
            this.update();
        },
        update: function () {
            this.constructQuery(this.options.searchTerm);
        },
        clear: function () {
            // cancel any outstanding requests
            this.query = null;
            arr.forEach(this.deferreds, function (def) {
                def.cancel();
            });
            if (this.deferreds) {
                this.deferreds.length = 0;
            }
            // remove existing Photos
            if (this.options.map.infoWindow.isShowing) {
                this.options.map.infoWindow.hide();
            }
            if (this.featureLayer.graphics.length > 0) {
                this.featureLayer.applyEdits(null, null, this.featureLayer.graphics);
            }
            this.dataPoints = [];
            this.geocoded_ids = {};
            this.onClear();
        },
        // Parse Links
        parseURL: function (text) {
            return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });
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
            var _self = this;
            if (dateObj) {
                return locale.format(dateObj, {
                    datePattern: _self.options.timePattern,
                    selector: "date"
                }).toLowerCase() + ' &middot; ' + locale.format(dateObj, {
                    datePattern: _self.options.datePattern,
                    selector: "date"
                });
            }
        },
        getRadius: function () {
            var map = this.options.map;
            var extent = this.options.map.extent;
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
        constructQuery: function (searchValue) {
            var search = lang.trim(searchValue);
            if (search.length === 0) {
                search = "";
            }
            var radius = this.getRadius();
            this.query = {
                bbox: radius.minPoint.x + "," + radius.minPoint.y + "," + radius.maxPoint.x + "," + radius.maxPoint.y,
                extras: "description, date_upload, owner_name, geo, url_s",
                per_page: this.options.limit,
                sort: 'date-posted-desc',
                safe_search: 2,
                content_type: 1,
                tags: search,
                method: "flickr.photos.search",
                api_key: this.options.apiKey,
                has_geo: 1,
                page: 1,
                format: "json"
            };
            if (this.options.dateTo && this.options.dateFrom) {
                this.query.max_taken_date = Math.round(this.options.dateTo / 1000);
                this.query.min_taken_date = Math.round(this.options.dateFrom / 1000);
            }
            // make the actual Flickr API call
            this.pageCount = 1;
            this.sendRequest(this.baseurl + "?" + ioQuery.objectToQuery(this.query));
        },
        sendRequest: function (url) {
            // get the results from Flickr for each page
            var deferred = esriRequest({
                url: url,
                handleAs: "json",
                timeout: 10000,
                callbackParamName: "jsoncallback",
                preventCache: true,
                load: lang.hitch(this, function (data) {
                    if (data.stat !== 'fail') {
                        if (data.photos.photo.length > 0) {
                            this.mapResults(data);
                            // display results for multiple pages
                            if ((this.options.autopage) && (this.options.maxpage > this.pageCount) && (data.photos.page < data.photos.pages) && (this.query)) {
                                this.pageCount++;
                                this.query.page++;
                                this.sendRequest(this.baseurl + "?" + ioQuery.objectToQuery(this.query));
                            } else {
                                this.onUpdateEnd();
                            }
                        } else {
                            // No results found, try another search term
                            this.onUpdateEnd();
                        }
                    } else {
                        if (data.code === 100) {
                            console.log(data.code + ' - ' + this.options.title + ': ' + data.message);
                        }
                        // No results found, try another search term
                        this.onUpdateEnd();
                    }
                }),
                error: lang.hitch(this, function (e) {
                    if (deferred.canceled) {
                        console.log('Search Cancelled');
                    } else {
                        console.log('Search error' + ": " + e.message.toString());
                    }
                    this.onError(e);
                })
            });
            this.deferreds.push(deferred);
        },
        unbindDef: function (dfd) {
            // if deferred has already finished, remove from deferreds array
            var index = arr.indexOf(this.deferreds, dfd);
            if (index === -1) {
                return; // did not find
            }
            this.deferreds.splice(index, 1);
            if (!this.deferreds.length) {
                return 2; // indicates we received results from all expected deferreds
            }
            return 1; // found and removed
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
            var _self = this;
            if (j.error) {
                console.log("mapResults error: " + j.error);
                this.onError(j.error);
                return;
            }
            var b = [];
            var k = j.photos.photo;
            arr.forEach(k, lang.hitch(this, function (result) {
                result.smType = this.options.id;
                result.filterType = 4;
                result.filterContent = 'http://www.flickr.com/photos/' + result.owner + '/' + result.id + '/in/photostream';
                result.filterAuthor = result.owner;
                // eliminate geo photos which we already have on the map
                if (this.geocoded_ids[result.id]) {
                    return;
                }
				// filter variable
				var filter = false, i;
				// check for filterd user
				if(_self.options.filterUsers && _self.options.filterUsers.length){
					for(i = 0; i < _self.options.filterUsers.length; i++){
						if(_self.options.filterUsers[i].toString() === result.owner.toString()){
							filter = true;
							break;
						}
					}
				}
				// check if contains bad word
				if(!filter && _self.options.filterWords && _self.options.filterWords.length){
					for(i = 0; i < _self.options.filterWords.length; i++){
						if(_self.findWordInText(_self.options.filterWords[i], result.title)){
							filter = true;
							break;
						}
						if(_self.findWordInText( _self.options.filterWords[i], result.description._content)){
							filter = true;
							break;
						}
					}
				}
				// if this feature needs to be filtered
				if(filter){
					return;
				}
                this.geocoded_ids[result.id] = true;
                var geoPoint = null;
                if (result.latitude) {
                    var g = [result.latitude, result.longitude];
                    geoPoint = Point(parseFloat(g[1]), parseFloat(g[0]));
                }
                if (geoPoint) {
                    if (!isNaN(geoPoint.x) & !isNaN(geoPoint.y)) {
                        // convert the Point to WebMercator projection
                        var a = new webMercatorUtils.geographicToWebMercator(geoPoint);
                        // make the Point into a Graphic
                        var graphic = new Graphic(a);
                        graphic.setAttributes(result);
                        b.push(graphic);
                        var date = new Date(parseInt(result.dateupload * 1000, 10));
                        result.dateformatted = this.formatDate(date);
                        result.location = location;
                        this.dataPoints.push({
                            geometry: {
                                x: a.x,
                                y: a.y
                            },
                            symbol: this.options.symbol,
                            attributes: result
                        });
                    }
                }

            }));
            this.featureLayer.applyEdits(b, null, null);
            this.onUpdate();
        },
        onClear: function () {},
        onError: function () {
            this.onUpdateEnd();
        },
        onUpdate: function () {},
        onUpdateEnd: function () {
            this.query = null;
        }
    });
    return Widget;
});