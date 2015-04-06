define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/ready",
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/on",
    "dojo/date/stamp",
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
    ready,
    Stateful, Evented, on,
    stamp, locale,
    InfoTemplate,
    FeatureLayer,
    mathUtils,
    webMercatorUtils,
    Point,
    esriRequest,
    Graphic,
    PictureMarkerSymbol
  ) {
    return declare("modules.YouTubeLayer", [Stateful, Evented], {
      options: {
        map: null,
        filterUsers: [],
        filterWords: [],
        autopage: true,
        visible: true,
        maxpage: 1,
        limit: 50,
        title: 'YouTube',
        id: 'youtube',
        searchTerm: '',
        time: 'all_time', // this_week, this_month, today
        datePattern: "MMM d, yyyy",
        timePattern: "h:mma",
        minScale: null,
        maxScale: null,
        symbol: null,
        infoTemplate: null,
        key: '',
        refreshTime: 4000,
        url: "https://www.googleapis.com/youtube/v3",
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
        this.set("datePattern", defaults.datePattern);
        this.set("timePattern", defaults.timePattern);
        this.set("searchTerm", defaults.searchTerm);
        this.set("time", defaults.time);
        this.set("symbol", defaults.symbol);
        this.set("infoTemplate", defaults.infoTemplate);
        this.set("key", defaults.key);
        this.set("url", defaults.url);
        this.set("minScale", defaults.minScale);
        this.set("maxScale", defaults.maxScale);
        this.set("refreshTime", defaults.refreshTime);
        this.set("graphics", []);
        this.set("noGeo", []);
        // listeners
        this.watch("visible", this._visible);
        this.watch("searchTerm", this.update);
        this.watch("time", this.update);
        // private vars
        this._deferreds = [];
        this._events = [];
        this._dataIds = {};
        // classes
        this._css = {
          container: "youtube-popup",
          title: "title",
          stats: "stats",
          imageAnchor: "image-anchor",
          image: "image",
          ownername: "ownername",
          content: "content",
          date: "date"
        };
        // map required
        if (!this.map) {
          console.log('YouTube::Reference to esri.Map object required');
          return;
        }
        // default symbol
        if (!this.symbol) {
          this.set("symbol", new PictureMarkerSymbol('images/map/youtube25x30.png', 25, 30).setOffset(0, 7));
        }
        // default infoTemplate
        if (!this.infoTemplate) {
          this.set("infoTemplate", new InfoTemplate('YouTube', '<div class="' + this._css.container + '"><div class="' + this._css.title + '">${video_title}</div><a tabindex="0" class="' + this._css.imageAnchor + '" href="${link}" target="_blank"><span class="' + this._css.stats + '">${seconds}</span><img class="' + this._css.image + '" width="${width}" height="${height}" src="${thumbnail}"></a><div class="' + this._css.content + '">${descriptionText}</div><div class="' + this._css.ownername + '"><a tabindex="0" href="${channel_link}" target="_blank">${full_name}</a></div><div class="' + this._css.date + '">${dateformatted}</div></div>'));
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
        // dom ready
        ready(lang.hitch(this, function () {
          // query when map loads
          if (this.map.loaded) {
            this._init();
          } else {
            on.once(this.map, "load", lang.hitch(this, function () {
              this._init();
            }));
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
      // error
      /* ---------------- */
      /* Public Functions */
      /* ---------------- */
      destroy: function () {
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
        if (this.featureLayer && this.featureLayer.visibleAtMapScale && this.featureLayer.visible) {
          if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
          }
          // default to refresh time
          var refresh = this.refreshTime;
          // use param time if set
          if (typeof ms !== 'undefined') {
            refresh = ms;
          }
          this._refreshTimer = setTimeout(lang.hitch(this, function () {
            this._constructQuery();
          }), refresh);
        }
      },
      clear: function () {
        // remove timer
        if (this._refreshTimer) {
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
      _init: function () {
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
        this.update(0);
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
        var extent = this.map.extent;
        var center = extent.getCenter();
        this.maxRadius = 621;
        var radius = Math.min(this.maxRadius, Math.ceil(mathUtils.getLength(Point(extent.xmin, extent.ymin, map.spatialReference), Point(extent.xmax, extent.ymin, map.spatialReference)) * 3.281 / 5280 / 2));
        radius = Math.floor(radius);
        return {
          lat: Math.round(center.getLatitude() * 10000) / 10000,
          lng: Math.round(center.getLongitude() * 10000) / 10000,
          distance: radius
        };
      },
      _constructQuery: function () {
        var search = lang.trim(this.searchTerm);
        if (search.length === 0) {
          search = "";
        }
        var radius = this._getRadius();
        var timestamp = this._getTimestamp();
        this.query = {
          "part": "snippet",
          "type": "video",
          "order": "date",
          "maxResults": this.limit,
          "location": radius.lat + "," + radius.lng,
          "locationRadius": radius.distance + "mi",
          "key": this.key,
          "q": search
        };
        if (timestamp) {
          this.query.publishedAfter = stamp.toISOString(timestamp, {
            zulu: true
          });
          this.query.publishedBefore = stamp.toISOString(new Date(), {
            zulu: true
          });
        }
        // make the actual API call
        this.pageCount = 1;
        this._sendRequest(this.url, this.query);
      },
      _getTimestamp: function () {
        var t = this.get("time");
        var d = new Date();
        switch (t) {
        case "today":
          d.setHours(d.getHours() - 24);
          return d;
        case "this_week":
          d.setDate(d.getDate() - 7);
          return d;
        case "this_month":
          d.setMonth(d.getMonth() - 1);
          return d;
        case "all_time":
          return null;
        default:
          return null;
        }
      },
      _sendRequest: function (url, content) {
        // get the results for each page
        var deferred = esriRequest({
          url: url + "/search",
          handleAs: "json",
          timeout: 10000,
          content: content,
          callbackParamName: "callback",
          preventCache: true,
          load: lang.hitch(this, function (response) {
            // list of all id's to get location data from
            var ids = [];
            // if we have a response
            if (response && response.items && response.items.length) {
              // list of items
              var items = response.items;
              // next page of results
              var nextPageToken = response.nextPageToken;
              // each item
              for (var i = 0; i < items.length; i++) {
                var item = items[i];
                // if video id
                if (item.id && item.id.videoId) {
                  // add id to list of ids
                  var id = item.id.videoId;
                  ids.push(id);
                }
              }
            }
            // if we have a list of ids
            if (ids && ids.length) {
              // send request to get info for all ids
              esriRequest({
                url: url + "/videos",
                handleAs: "json",
                timeout: 10000,
                content: {
                  "id": ids.toString(),
                  "part": "id,recordingDetails,contentDetails",
                  "key": this.key
                },
                callbackParamName: "callback",
                preventCache: true,
                load: lang.hitch(this, function (data) {
                  // if we got location data
                  if (data && data.items && data.items.length) {
                    // location list of items
                    var locationItems = data.items;
                    // go through each item
                    for (var i = 0; i < items.length; i++) {
                      // location id
                      var item = items[i];
                      var itemId = item.id.videoId;
                      // go through each location item
                      for (var j = 0; j < locationItems.length; j++) {
                        var locationItem = locationItems[j];
                        // location item id
                        var locationItemId = locationItem.id;
                        // if item id matches location item id
                        if (itemId === locationItemId) {
                          // combine data
                          lang.mixin(item, locationItem);
                          // exit looop
                          break;
                        }
                      }
                    }
                  }
                  // if we have items
                  if (items.length > 0) {
                    // put results on the map
                    this._mapResults(items);
                    // display results for multiple pages
                    if ((this.autopage) && (this.maxpage > this.pageCount) && (this.query) && (nextPageToken)) {
                      this.pageCount++;
                      this.query.pageToken = nextPageToken;
                      this._sendRequest(this.url, this.query);
                    } else {
                      this._updateEnd();
                    }
                  } else {
                    // No results found, try another search term
                    this._updateEnd();
                  }
                }),
                error: lang.hitch(this, function (e) {
                  if (deferred.canceled) {
                    console.log('YouTube::Search Cancelled');
                  } else {
                    console.log('YouTube::Search error' + ": " + e.message.toString());
                  }
                  this._error(e);
                })
              });
            }
          }),
          error: lang.hitch(this, function (e) {
            if (deferred.canceled) {
              console.log('YouTube::Search Cancelled');
            } else {
              console.log('YouTube::Search error' + ": " + e.message.toString());
            }
            this._error(e);
          })
        });
        this._deferreds.push(deferred);
      },
      _findWordInText: function (word, text) {
        if (word && text) {
          // text
          var searchString = text.toLowerCase();
          // word
          var badWord = ' ' + word.toLowerCase() + ' ';
          // if found
          if (searchString.indexOf(badWord) > -1) {
            return true;
          }
        }
        return false;
      },
      _formatTime: function (duration) {
        var hours = duration.match(/(\d+)H/);
        var minutes = duration.match(/(\d+)M/);
        var seconds = duration.match(/(\d+)S/);
        var str = "";
        if (hours && hours[1]) {
          if (hours[1].length == 1) {
            str += "0";
          }
          str += hours[1] + ":";
        }
        if (minutes && minutes[1]) {
          if (minutes[1].length == 1) {
            str += "0";
          }
          str += minutes[1] + ":";
        }
        if (seconds && seconds[1]) {
          if (seconds[1].length == 1) {
            str += "0";
          }
          str += seconds[1];
        }
        return str;
      },
      _mapResults: function (j) {
        var b = [];
        var ng = [];
        array.forEach(j, lang.hitch(this, function (result) {
          // add social media type/id for filtering
          result.smType = this.id;
          result.filterType = 3;
          result.filterContent = result.snippet.description;
          result.filterAuthor = result.snippet.channelId;
          // add date to result
          var date = new Date(result.snippet.publishedAt);
          result.dateformatted = this._formatDate(date);
          // add location protocol to result
          result.protocol = location.protocol;
          result.link = "https://www.youtube.com/watch?v=" + result.id;
          result.channel_link = "https://www.youtube.com/channel/" + result.snippet.channelId;
          result.full_name = result.snippet.channelTitle;
          result.video_title = result.snippet.title;
          result.descriptionText = this._parseURL(result.snippet.description);
          result.height = 90;
          result.width = 120;
          result.thumbnail = result.snippet.thumbnails.default.url;
          if (result.contentDetails && result.contentDetails.duration) {
            var duration = result.contentDetails.duration;
            result.seconds = this._formatTime(duration);
          }
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
              if (this.filterUsers[i].toString() === result.snippet.channelId.toString()) {
                filter = true;
                break;
              }
            }
          }
          // check if contains bad word
          if (!filter && this.filterWords && this.filterWords.length) {
            for (i = 0; i < this.filterWords.length; i++) {
              if (this._findWordInText(this.filterWords[i], result.snippet.title)) {
                filter = true;
                break;
              }
              if (this._findWordInText(this.filterWords[i], result.snippet.description)) {
                filter = true;
                break;
              }
            }
          }
          // if this feature needs to be filtered
          if (filter) {
            //console.log('filtered', result);
            return;
          }
          this._dataIds[result.id] = true;
          var geoPoint = null;
          if (result.recordingDetails) {
            if (result.recordingDetails.location) {
              geoPoint = Point(parseFloat(result.recordingDetails.location.longitude), parseFloat(result.recordingDetails.location.latitude));
            }
          }
          if (geoPoint && geoPoint.hasOwnProperty('x') && geoPoint.hasOwnProperty('y')) {
            // convert the Point to WebMercator projection
            var a = webMercatorUtils.geographicToWebMercator(geoPoint);
            // make the Point into a Graphic
            var graphic = new Graphic(a, this.symbol, result, this.infoTemplate);
            b.push(graphic);
          } else {
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
      _parseURL: function (text) {
        return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
          return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
      },
      _visible: function () {
        this.setVisibility(this.get("visible"));
      },
      _error: function (e) {
        this._updateEnd();
        this.emit("error", e);
      },
      _updateEnd: function () {
        this.query = null;
        this.emit("update-end", {});
      }
    });
  });