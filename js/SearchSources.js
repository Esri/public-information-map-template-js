define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/json", "dojo/dom-construct", "esri/lang", "esri/tasks/locator", "esri/layers/FeatureLayer", "esri/dijit/Search"], function (
  declare, lang, array, dojoJson, domConstruct, esriLang, Locator, FeatureLayer, Search) {
  return declare(null, {

    constructor: function (parameters) {

      var defaults = {
        sources: [],
        map: null,
        //the map 
        useMapExtent: false,
        //When true we restrict world locator to the map extent
        geocoders: [],
        esriSource: null,
        enableSearchingAll: true,
        //Geocoders defined in helper services
        itemData: null,
        //web map item info includes operational layers and info about searches configured on web map
        configuredSearchLayers: []
      };

      lang.mixin(this, defaults, parameters);
    },

    /* Public Methods */

    createOptions: function () {
      return {
        map: this.map,
        sources: this._createSources(),
        enableSearchingAll: this.enableSearchingAll,
        activeSourceIndex: this._getActiveSource()
      };
    },

    /* Private Methods */

    //optional array of additional search layers to configure from the application config process
    _createSources: function () {
      if (this.applicationConfiguredSources) {
        this._createAppConfigSources();
      } else {
        //Create services from org helper services 
        //Create locators defined in web map item
        //Create configured services. 
        this._createHelperServiceSources();
        if (this.itemData) {
          this._createWebMapItemSources();
        }
        if (this.configuredSearchLayers.length > 0) {
          this._createConfiguredSources();
        }
      }

      return this.sources;
    },

    _getActiveSource: function () {
      var activeIndex = 0;
      if (this.hasOwnProperty("activeSourceIndex")) {
        activeIndex = this.activeSourceIndex;
      }
      else{
        if (this.sources && this.enableSearchingAll && this.sources.length > 1) {
          activeIndex = "all";
        }
        array.some(this.sources, function (s, index) {
          if (!s.hasEsri && s.featureLayer) {
            activeIndex = index;
            return true;
          }
        });
      }
      return activeIndex;
    },
    _createHelperServiceSources: function () {
      var geocoders = lang.clone(this.geocoders);
      array.forEach(geocoders, lang.hitch(this, function (geocoder) {
        if (geocoder.url.indexOf(".arcgis.com/arcgis/rest/services/World/GeocodeServer") > -1) {
          var s = new Search();
          var esriSource = s.defaultSource;
          esriSource.hasEsri = true;
          //Some orgs have the Esri world locator added with 
          //a custom name defined. Use that name. 
          if (geocoder.name) {
            esriSource.name = geocoder.name;
          }
          //Restrict search to custom extent if defined
          if (this.useMapExtent) {
            esriSource.searchExtent = this.map.extent;
          }
          this.sources.push(esriSource);
          s.destroy();
        } else if (esriLang.isDefined(geocoder.singleLineFieldName)) {
          geocoder.locator = new Locator(geocoder.url);
          this.sources.push(geocoder);
        }
      }));
    },

    _createWebMapItemSources: function () {
      if (this.itemData && this.itemData.applicationProperties && this.itemData.applicationProperties.viewing && this.itemData.applicationProperties.viewing.search) {
        //search is configured on the web map item 
        var searchOptions = this.itemData.applicationProperties.viewing.search;
        array.forEach(searchOptions.layers, lang.hitch(this, function (searchLayer) {
          //get the title specified in the item
          var operationalLayers = this.itemData.operationalLayers,
            layer = null;
          array.some(operationalLayers, function (opLayer) {
            if (opLayer.id === searchLayer.id) {
              layer = opLayer;
              return true;
            }
          });
          if (layer && layer.hasOwnProperty("url")) {
            var source = {},
              url = layer.url,
              name = layer.title || layer.name;
            if (esriLang.isDefined(searchLayer.subLayer)) {
              url = url + "/" + searchLayer.subLayer;
              array.some(layer.layerObject.layerInfos, function (info) {
                if (info.id === searchLayer.subLayer) {
                  name += " - " + layer.layerObject.layerInfos[searchLayer.subLayer].name;
                  return true;
                }
              });
            }
            //Get existing layer or create new one
            var mapLayer = this.map.getLayer(layer.id);
            if (mapLayer && (mapLayer.type === "Feature Layer" || mapLayer.type === "FeatureLayer")) {
              source.featureLayer = mapLayer;
            } else {
              source.featureLayer = new FeatureLayer(url, {
                outFields: ["*"]
              });
            }
            source.name = name;
            source.exactMatch = searchLayer.field.exactMatch;
            source.searchFields = [searchLayer.field.name];
            source.displayField = searchLayer.field.name;
            source.outFields = ["*"];
            source.placeholder = searchOptions.hintText;
            this.sources.push(source);
          }
        }));
      }
    },
    _createAppConfigSources: function () {
      // Configured via the new Search Configuation widget
      var configSource = lang.clone(this.applicationConfiguredSources);
      array.forEach(configSource, lang.hitch(this, function (source) {
        if (source.locator) {
          source.locator = new Locator(source.url);
        } else { //feature layer
          var featureLayer = null;
          if (source.flayerId) {
            featureLayer = this.map.getLayer(source.flayerId);
          }
          if (!featureLayer && source.url) {
            featureLayer = new FeatureLayer(source.url, {
              outFields: ["*"]
            });
          }
          source.featureLayer = featureLayer;
        }
        if (source.searchWithinMap) {
          source.searchExtent = this.map.extent;
        }
        this.sources.push(source);
      }));

    },
    _createConfiguredSources: function () {
      // Old configuration using layer/field picker 
      array.forEach(this.configuredSearchLayers, lang.hitch(this, function (layer) {
        var mapLayer = this.map.getLayer(layer.id);
        if (mapLayer) {
          var source = {};
          source.featureLayer = mapLayer;
          if (layer.fields && layer.fields.length && layer.fields.length > 0) {
            source.searchFields = layer.fields;
            source.displayField = layer.fields[0];
            source.outFields = ["*"];
            this.sources.push(source);
          }
        }
      }));
    }

  });
});