define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/kernel",
    "dojo/ready",
    "dojo/request/script",
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
    declare, array, lang, dojo,
    ready,
    script,
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
    return declare("application.TwitterLayer", [Stateful, Evented], {
        options: {
            map: null,
            filterUsers: [],
            filterWords: [],
            autopage: true,
            visible: true,
            maxpage: 5,
            limit: 100,
            title: 'Twitter',
            id: 'twitter',
            datePattern: "MMM d, yyyy",
            timePattern: "h:mma",
            searchTerm: '',
            minScale: null,
            maxScale: null,
            symbol: null,
            infoTemplate: null,
            url: null,
            result_type: 'recent',
            refreshTime: 4000
        },
        constructor: function (options) {
            // mixin options
            var defaults = lang.mixin({}, this.options, options);
            // properties
            this.set("map", defaults.map);
            this.set("filterUsers", defaults.filterUsers);
            this.set("filterWords", defaults.filterWords);
            this.set("autopage", defaults.autopage);
            this.set("visible", defaults.visible);
            this.set("maxpage", defaults.maxpage);
            this.set("limit", defaults.limit);
            this.set("title", defaults.title);
            this.set("id", defaults.id);
            this.set("url", defaults.url);
            this.set("datePattern", defaults.datePattern);
            this.set("timePattern", defaults.timePattern);
            this.set("searchTerm", defaults.searchTerm);
            this.set("symbol", defaults.symbol);
            this.set("infoTemplate", defaults.infoTemplate);
            this.set("dateFrom", defaults.dateFrom);
            this.set("dateTo", defaults.dateTo);
            this.set("key", defaults.key);
            this.set("minScale", defaults.minScale);
            this.set("maxScale", defaults.maxScale);
            this.set("refreshTime", defaults.refreshTime);
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
                container: "twitter-popup",
                imageAnchor: "image-anchor",
                image: "image",
                followButton: "follow-button",
                username: "username",
                user: "user",
                clear: "clear",
                content: "content",
                date: "date",
                actions: "actions",
                actionReply: "action-reply",
                actionRetweet: "action-retweet",
                actionFavorite: "action-favorite"
            };
            // map required
            if (!this.map) {
                console.log('Twitter::Reference to esri.Map object required');
                return;
            }
            // default symbol
            if (!this.symbol) {
                this.set("symbol", new PictureMarkerSymbol('images/map/twitter25x30.png', 25, 30).setOffset(0,7));
            }
            // default infoTemplate
            if (!this.infoTemplate) {
                this.set("infoTemplate", new InfoTemplate('Twitter', '<div class="' + this._css.container + '"><a tabindex="0" class="' + this._css.imageAnchor + '" href="${protocol}//twitter.com/${user_screen_name}/status/${id_str}" target="_blank"><img class="' + this._css.image + '" src="${user_profile_image_url_https}" width="40" height="40"></a><div class="' + this._css.followButton + '"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="//platform.twitter.com/widgets/follow_button.html?screen_name=${user_screen_name}&lang=${dojo_locale}&show_count=false&show_screen_name=false" style="width:60px; height:20px;"></iframe></div><div class="' + this._css.username + '">${name}</div><div class="' + this._css.user + '"><a target="_blank" href="${protocol}//twitter.com/${user_screen_name}">&#64;${user_screen_name}</a></div><div class="' + this._css.clear + '"></div><div class="' + this._css.content + '">${textFormatted}</div><div class="' + this._css.date + '"><a target="_blank" href="${protocol}//twitter.com/${user_screen_name}/status/${id_str}">${dateformatted}</a></div><div class="' + this._css.actions + '"><a class="' + this._css.actionReply + '" href="https://twitter.com/intent/tweet?in_reply_to=${id_str}&lang=${dojo_locale}"></a><a class="' + this._css.actionRetweet + '" href="https://twitter.com/intent/retweet?tweet_id=${id_str}&lang=${dojo_locale}"></a><a class="' + this._css.actionFavorite + '" href="https://twitter.com/intent/favorite?tweet_id=${id_str}&lang=${dojo_locale}"></a></div></div>'));
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
            script.get(location.protocol + '//platform.twitter.com/widgets.js', {}).then(function () {}, function (err) {
                console.log(err.toString());
            });
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
            // dom ready
            ready(lang.hitch(this, function(){
                // query when map loads
                if(this.map.loaded){
                    this._init();
                }
                else{
                    var onLoad = on.once(this.map, "load", lang.hitch(this, function () {
                        this._init();
                    }));
                    this._events.push(onLoad);
                }
                // loaded
                this.set("loaded", true);
                this.emit("load", {});
            }));
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // clear
        // update
        // update-end
        // authorize
        // error
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
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
        update: function (ms) {
            if(this.featureLayer && this.featureLayer.visibleAtMapScale && this.featureLayer.visible){
                if(this._refreshTimer){
                    clearTimeout(this._refreshTimer);
                }
                // default to refresh time
                var refresh = this.refreshTime;
                // use param time if set
                if(typeof ms !== 'undefined'){
                    refresh = ms;
                }
                this._refreshTimer = setTimeout(lang.hitch(this, function() {
                    this._constructQuery();
                }), refresh);
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
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function(){
            // Events
            var extentChange = on(this.map, "extent-change", lang.hitch(this, function () {
                this.update();
            }));
            this._events.push(extentChange);
            var visChange = on(this.featureLayer, "visibility-change", lang.hitch(this, function () {
                this.clear();
                this.update(0);
            }));
            this._events.push(visChange);
            this.update();
        },
        _parseURL: function (text) {
            return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });
        },
        _parseUsername: function (text) {
            return text.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
                var username = u.replace("@", "");
                return '<a target="_blank" href="' + location.protocol + '//twitter.com/' + username + '">' + u + '</a>';
            });
        },
        _parseHashtag: function (text) {
            return text.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
                var tag = t.replace("#", "%23");
                return '<a target="_blank" href="https://twitter.com/search?q=' + tag + '">' + t + '</a>';
            });
        },
        // Format Date Object
        _formatDate: function (dateObj) {
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
        _getRadius: function () {
            var map = this.map;
            var extent = map.extent;
            this.maxRadius = 932;
            var radius = Math.min(this.maxRadius, Math.ceil(mathUtils.getLength(Point(extent.xmin, extent.ymin, map.spatialReference), Point(extent.xmax, extent.ymin, map.spatialReference)) * 3.281 / 5280 / 2));
            radius = Math.round(radius, 0);
            var geoPoint = webMercatorUtils.webMercatorToGeographic(extent.getCenter());
            return {
                radius: radius,
                center: geoPoint,
                units: "mi"
            };
        },
        _constructQuery: function () {
            var loc = false;
            var localeTmp = dojo.locale.split('-');
            if (localeTmp[0]) {
                loc = localeTmp[0];
            }
            var search = lang.trim(this.searchTerm);
            if (search.length === 0) {
                search = "";
            }
            var radius = this._getRadius();
            this.query = {
                q: search,
                count: this.limit,
                result_type: this.result_type,
                include_entities: false,
                geocode: (Math.round(radius.center.y * 10000)/10000) + "," + (Math.round(radius.center.x * 10000)/10000) + "," + radius.radius + radius.units
            };
            if (loc) {
                this.query.locale = loc;
            }
            // make the actual API call
            this.pageCount = 1;
            this._sendRequest(this.url, this.query);
        },
        _sendRequest: function (url, content) {
            // get the results for each page
            var deferred = esriRequest({
                url: url,
                handleAs: "json",
                timeout: 10000,
                content: content,
                callbackParamName: "callback",
                preventCache: true,
                failOk: true,
                handle: lang.hitch(this, function (data) {
                    if(data.errors && data.errors.length > 0){
                        var errors = data.errors;
                        this._error(errors);
                    }
                    if(data && data.signedIn === false){
                        this.set("authorized", false);
                        this.emit("authorize", {
                            authorized: false
                        });
                        this._updateEnd();
                    }
                    else if (data.statuses && data.statuses.length > 0) {
                        if(!this.get("authorized")){
                            this.set("authorized", true);
                            this.emit("authorize", {
                                authorized: true
                            });
                        }
                        this._mapResults(data);
                        // display results for multiple pages
                        if ((this.get("autopage")) && (this.get("maxpage") > this.pageCount) && (data.search_metadata.next_results) && (this.query)) {
                            this.pageCount++;
                            this._sendRequest(this.get("url") + data.search_metadata.next_results);
                        } else {
                            this._updateEnd();
                        }
                    } else {
                        // No results found, try another search term
                        this.set("authorized", true);
                        this._updateEnd();
                    }
                })
            });
            this._deferreds.push(deferred);
        },
		_findWordInText: function (word, text) {
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
        _mapResults: function (j) {
            if (j.error) {
                console.log("Twitter::_mapResults error: " + j.error);
                this._error(j.error);
                return;
            }
            var b = [];
            var ng = [];
            var k = j.statuses;
            array.forEach(k, lang.hitch(this, function (result) {
                // add social media type/id for filtering                
                result.smType = this.id;
                result.filterType = 2;
                result.filterContent = 'https://twitter.com/#!/' + result.user.id_str + '/status/' + result.id_str;
                result.filterAuthor = result.user.id_str;
                // add date to result
                var date = new Date(result.created_at);
                result.dateformatted = this._formatDate(date);
                // add location protocol to result
                result.protocol = location.protocol;
                // user items
                result.user_profile_image_url_https = result.user.profile_image_url_https;
                result.user_screen_name = result.user.screen_name;
                result.user_name = result.user.name;
                // set locale
                var tmp = dojo.locale.split('-');
                var loc = 'en';
                if (tmp[0]) {
                    loc = tmp[0];
                }
                result.dojo_locale = loc;
                // format text
                var linkedText = this._parseURL(result.text);
                linkedText = this._parseUsername(linkedText);
                linkedText = this._parseHashtag(linkedText);
                result.textFormatted = linkedText;
                // eliminate geo photos which we already have on the map
                if (this._dataIds[result.id]) {
                    return;
                }
				// filter variable
                var filter = false,
                    i;
                // check for filterd user
                if (this.filterUsers && this.filterUsers.length) {
                    for (i = 0; i < this.filterUsers.length; i++) {
                        if (this.filterUsers[i].toString() === result.user.id_str.toString()) {
                            filter = true;
                            break;
                        }
                    }
                }
                // check if contains bad word
                if (!filter && this.filterWords && this.filterWords.length) {
                    for (i = 0; i < this.filterWords.length; i++) {
                        if (this._findWordInText(this.filterWords[i], result.text)) {
                            filter = true;
                            break;
                        }
                    }
                }
				// if this feature needs to be filtered
				if(filter){
                    //console.log('filtered', result);
					return;
				}
                this._dataIds[result.id] = true;
                var geoPoint = null;
                if (result.geo) {
                    var g = result.geo.coordinates;
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
                    ng.push(result);
                }
            }));
            // add new graphics to widget
            var graphics = this.get("graphics");
            graphics = graphics.concat(b);
            this.set("graphics", graphics);
            // add non geocode results to noGeo
            var noGeo = this.get("noGeo");
            noGeo.concat(ng);
            this.set("noGeo", noGeo);
            // add new graphics to layer
            this.featureLayer.applyEdits(b, null, null);
            // update event with new graphics
            this.emit("update", {
                graphics: b,
                noGeo: ng
            });
        },
        _visible: function() {
            this.setVisibility(this.get("visible"));
        },
        _error: function(e){
            this.emit("error", e);
        },
        _updateEnd: function () {
            this.query = null;
            this.emit("update-end", {});
        }
    });
});