define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/ready",
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
    ready,
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
    return declare("application.WebcamsLayer", [Stateful, Evented], {
      options: {
        map: null,
        autopage: true,
        visible: true,
        maxpage: 1,
        limit: 50,
        title: 'Webcams.travel',
        id: 'webcams',
        datePattern: "MMM d, yyyy",
        timePattern: "h:mma",
        minScale: null,
        maxScale: null,
        symbol: null,
        infoTemplate: null,
        key: null,
        url: "https://webcamstravel.p.mashape.com",
        refreshTime: 4000
      },
      constructor: function (options) {
        // mixin options
        var defaults = lang.mixin({}, this.options, options);
        // properties
        this.set("map", defaults.map);
        this.set("autopage", defaults.autopage);
        this.set("visible", defaults.visible);
        this.set("maxpage", defaults.maxpage);
        this.set("limit", defaults.limit);
        this.set("title", defaults.title);
        this.set("id", defaults.id);
        this.set("datePattern", defaults.datePattern);
        this.set("timePattern", defaults.timePattern);
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
        // private vars
        this._deferreds = [];
        this._events = [];
        this._dataIds = {};
        // classes
        this._css = {
          container: "webcams-popup",
          imageAnchor: "image-anchor",
          image: "image",
          title: "title",
          location: "location",
          credits: "credits",
          logo: "logo-credits",
          date: "date"
        };
        // map required
        if (!this.map) {
          console.log('Webcams::Reference to esri.Map object required');
          return;
        }
        // default symbol
        if (!this.symbol) {
          this.set("symbol", new PictureMarkerSymbol('images/map/webcam32x32.png', 32, 32));
        }
        // default infoTemplate
        if (!this.infoTemplate) {
          this.set("infoTemplate", new InfoTemplate('Webcam', '<div class="' + this._css.container + '"><div class="' + this._css.title + '">${title}</div><a tabindex="0" class="' + this._css.imageAnchor + '" href="${url}" target="_blank"><img width="${thumbnail_width}" height="${thumbnail_height}" class="' + this._css.image + '" src="${thumbnail_url}" /></a><div class="' + this._css.location + '">${city}, ${region} ${country}</div><div class="' + this._css.date + '">${dateformatted}</div><div class="' + this._css.logo + '"><a href="http://www.webcams.travel" target="_blank"><img src="http://www.webcams.travel/img/linking/logo_125x30.jpg" border="0" alt="Webcams worldwide - Webcams.travel"/></a></div><div class="' + this._css.credits + '">Webcams provided by <a href="http://www.webcams.travel/" target="_blank">webcams.travel</a></div></div>'));
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
          }
          else {
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
            this._sendRequest();
          }), refresh);
        }
      },
      clear: function () {
        // remove timer
        if (this._refreshTimer) {
          clearTimeout(this._refreshTimer);
        }
        // cancel any outstanding requests
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
        }
        else {
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
        this.update();
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
      _constructUrl: function () {
        var extent = this.map.geographicExtent;
        var url = "";
        if (extent) {
          url += this.url + "/webcams/map/";
          url += extent.ymax; // ne_lat
          url += ",";
          url += extent.xmax; // ne_lng
          url += ",";
          url += extent.ymin; // sw_lat
          url += ",";
          url += extent.xmin; // sw_lng
          url += ",";
          url += this.map.getLevel(); // zoom
        }
        return url;
      },
      _sendRequest: function () {
        // get the results for each page
        var deferred = esriRequest({
          url: this._constructUrl(),
          handleAs: "json",
          timeout: 10000,
          content: {
            "show": "webcams:basic,image,location,url",
            "lang": "en",
            "mashape-key": this.key
          },
          callbackParamName: "callback",
          preventCache: true,
          load: lang.hitch(this, function (data) {
            if (data.status === "OK") {
              if (data.result.total > 0) {
                this._mapResults(data);
                this._updateEnd();
              }
              else {
                // No results found, try another search term
                this._updateEnd();
              }
            }
            else {
              // No results found, try another search term
              this._updateEnd();
            }
          }),
          error: lang.hitch(this, function (e) {
            if (deferred.canceled) {
              console.log('Webcams::Search Cancelled');
            }
            else {
              console.log('Webcams::Search error' + ": " + e.message.toString());
            }
            this._error(e);
          })
        });
        this._deferreds.push(deferred);
      },
      _mapResults: function (j) {
        if (j.error) {
          console.log("Webcams::_mapResults error: " + j.error);
          this._error(j.error);
          return;
        }
        var b = [];
        var ng = [];
        var k = j.result.webcams;
        array.forEach(k, lang.hitch(this, function (result) {
          // add date to result
          var date = new Date(parseInt(result.image.update * 1000, 10));
          result.dateformatted = this._formatDate(date);
          // eliminate geo photos which we already have on the map
          if (this._dataIds[result.id]) {
            return;
          }
          this._dataIds[result.id] = true;
          var geoPoint = null;
          if (result.location.latitude) {
            var g = [result.location.latitude, result.location.longitude];
            geoPoint = Point(parseFloat(g[1]), parseFloat(g[0]));
          }
          result.thumbnail_url = result.image.current.thumbnail;
          result.thumbnail_width = result.image.sizes.thumbnail.width;
          result.thumbnail_height = result.image.sizes.thumbnail.height;
          result.city = result.location.city;
          result.region = result.location.region;
          result.country = result.location.country_code;
          result.url = result.url.current.desktop;
          // webcam icon
          var symbol = new PictureMarkerSymbol(result.image.daylight.icon, 32, 32);
          // if point is set
          if (geoPoint && geoPoint.hasOwnProperty('x') && geoPoint.hasOwnProperty('y')) {
            // convert the Point to WebMercator projection
            var a = webMercatorUtils.geographicToWebMercator(geoPoint);
            // make the Point into a Graphic
            var graphic = new Graphic(a, symbol, result, this.infoTemplate);
            b.push(graphic);
          }
          else {
            ng.push(result);
          }
        }));
        // add new graphics to widget
        var graphics = this.get("graphics");
        graphics.concat(b);
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
      _visible: function () {
        this.setVisibility(this.get("visible"));
      },
      _error: function (e) {
        this._updateEnd();
        this.emit("error", e);
      },
      _updateEnd: function () {
        this.emit("update-end", {});
      }
    });
  });
