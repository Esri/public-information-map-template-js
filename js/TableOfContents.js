define([
  "dojo/_base/array",
  "dojo/_base/declare",
  "dojo/_base/lang",

  "dojo/Evented",
  "dojo/Deferred",
  "dojo/on",

  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/dom-attr",

  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",

  "esri/promiseList",

  "dojo/text!application/dijit/templates/TableOfContents.html"
],
  function (
    array, declare, lang,
    Evented, Deferred, on,
    domClass, domStyle, domConstruct, domAttr,
    _WidgetBase, _TemplatedMixin,
    promiseList,
    dijitTemplate
  ) {
    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: dijitTemplate,

      options: {
        theme: "TableOfContents",
        map: null,
        layers: null,
        subLayers: true,
        removeUnderscores: true,
        visible: true
      },

      // lifecycle: 1
      constructor: function (options, srcRefNode) {
        // mix in settings and defaults
        var defaults = lang.mixin({}, this.options, options);
        // widget node
        this.domNode = srcRefNode;
        // properties
        this.set(defaults);
        // classes
        this.css = {
          container: "tocContainer",
          list: "tocList",
          subList: "tocSubList",
          subListLayer: "tocSubListLayer",
          layer: "tocLayer",
          layerScaleInvisible: "tocScaleInvisible",
          title: "tocTitle",
          titleContainer: "tocTitleContainer",
          checkbox: "tocCheckbox",
          label: "tocLabel",
          settings: "tocSettings",
          settingsIcon: "esriIconSettings2",
          icon: "esriIcon",
          customContent: "tocCustomContent",
          clear: "tocClear"
        };
      },

      postCreate: function () {
        var _self = this;
        // when checkbox is clicked
        this.own(on(this._layersNode, "." + this.css.checkbox + ":click", function () {
          var data, subData;
          // layer index
          data = domAttr.get(this, "data-layer-index");
          // subLayer index
          subData = domAttr.get(this, "data-sublayer-index");
          // toggle layer visibility
          _self._toggleLayer(data, subData);
        }));
      },

      // start widget. called by user
      startup: function () {
        if (this.map) {
          // when map is loaded
          if (this.map.loaded) {
            this._init();
          } else {
            on.once(this.map, "load", lang.hitch(this, function () {
              this._init();
            }));
          }
        } else {
          this._init();

        }
      },

      // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
      destroy: function () {
        this._removeEvents();
        this.inherited(arguments);
      },

      /* ---------------- */
      /* Public Events */
      /* ---------------- */
      // load
      // toggle

      /* ---------------- */
      /* Public Functions */
      /* ---------------- */

      show: function () {
        this.set("visible", true);
      },

      hide: function () {
        this.set("visible", false);
      },

      refresh: function () {
        // all layer info
        var layers = this.layers;
        // store nodes here
        this._nodes = [];
        var promises = [];
        // if we got layers
        if (layers && layers.length) {
          for (var i = 0; i < layers.length; i++) {
            promises.push(this._layerLoaded(i));
          }
        }
        // wait for layers to load or fail
        var pL = new promiseList(promises).always(lang.hitch(this, function (response) {
          this._loadedLayers = response;
          this._removeEvents();
          this._createLayerNodes();
          this._setLayerEvents();
          this.emit("refresh", {});
        }));
        // return promise
        return pL;
      },

      /* ---------------- */
      /* Private Functions */
      /* ---------------- */

      _layerLoaded: function (layerIndex) {
        var layers = this.layers;
        var layerInfo = layers[layerIndex];
        var layer;
        if (this.map) {
          layer = this.map.getLayer(layerInfo.id);
        } else {
          layer = layerInfo.layerObject || layerInfo;
        }
        // returned event
        var evt = {
          layer: layer,
          layerInfo: layerInfo,
          layerIndex: layerIndex
        };
        var def = new Deferred();
        if (layer) {
          if (layer.loaded) {
            // nothing to do
            def.resolve(evt);
          } else if (layer.loadError) {
            def.reject(layer.loadError);
          } else {
            var loadedEvent, errorEvent;
            // once layer is loaded
            loadedEvent = on.once(layer, "load", lang.hitch(this, function () {
              errorEvent.remove();
              def.resolve(evt);
            }));
            // error occurred loading layer
            errorEvent = on.once(layer, "error", lang.hitch(this, function (error) {
              loadedEvent.remove();
              def.reject(error);
            }));
          }
        } else {
          def.resolve(evt);
        }
        return def.promise;
      },

      _checkboxStatus: function (layerInfo) {
        return layerInfo.visibility || false;
      },

      _WMSVisible: function (layerInfo, subLayerInfo) {
        var checked = false;
        var visibleLayers = [];
        if (layerInfo && layerInfo.layerObject) {
          visibleLayers = layerInfo.layerObject.visibleLayers;
        }
        var found = array.indexOf(visibleLayers, subLayerInfo.name);
        if (found !== -1) {
          checked = true;
        }
        return checked;
      },

      _subCheckboxStatus: function (layerInfo, subLayerInfo) {
        var checked = false;
        switch (layerInfo.layerType) {
        case "KML":
          checked = subLayerInfo.visible;
          break;
        case "WMS":
          checked = this._WMSVisible(layerInfo, subLayerInfo);
          break;
        default:
          checked = subLayerInfo.defaultVisibility;
        }
        return checked;
      },

      _getLayerTitle: function (e) {
        var title = "";
        // get best title
        if (e.layerInfo && e.layerInfo.title) {
          title = e.layerInfo.title;
        } else if (e.layer && e.layer.name) {
          title = e.layer.name;
        } else if (e.layerInfo && e.layerInfo.id) {
          title = e.layerInfo.id;
        }
        // optionally remove underscores
        if (this.removeUnderscores) {
          title = title.replace(/_/g, " ");
        }
        return title;
      },

      _createLayerNodes: function () {
        // clear node
        this._layersNode.innerHTML = "";
        var loadedLayers = this._loadedLayers;
        // create nodes for each layer
        for (var i = 0; i < loadedLayers.length; i++) {
          var response = loadedLayers[i];
          if (response) {
            var layer = response.layer;
            var layerIndex = response.layerIndex;
            var layerInfo = response.layerInfo;
            if (layerInfo) {
              var subLayers;
              // layer node
              var layerNode = domConstruct.create("li", {
                className: this.css.layer
              });
              // currently visible layer
              if (layer && !layer.visibleAtMapScale) {
                domClass.add(layerNode, this.css.layerScaleInvisible);
              }
              domConstruct.place(layerNode, this._layersNode, "first");
              // title of layer
              var titleNode = domConstruct.create("div", {
                className: this.css.title
              }, layerNode);
              // nodes for subLayers
              var subNodes = [];
              var layerType = layerInfo.layerType;
              // get parent layer checkbox status
              var status = this._checkboxStatus(layerInfo);
              // title container
              var titleContainerNode = domConstruct.create("div", {
                className: this.css.titleContainer
              }, titleNode);
              var id = this.id + "_checkbox_" + layerIndex;
              // Title checkbox
              var checkboxNode = domConstruct.create("input", {
                type: "checkbox",
                id: id,
                "data-layer-index": layerIndex,
                className: this.css.checkbox
              }, titleContainerNode);
              domAttr.set(checkboxNode, "checked", status);
              // optional settings icon
              var settingsNode;
              if (layerInfo.settingsId) {
                settingsNode = domConstruct.create("div", {
                  id: layerInfo.settingsId,
                  className: this.css.icon + " " + this.css.settingsIcon + " " + this.css.settings
                }, titleContainerNode);
              }
              // Title text
              var title = this._getLayerTitle(response);
              var labelNode = domConstruct.create("label", {
                className: this.css.label,
                textContent: title
              }, titleContainerNode);
              domAttr.set(labelNode, "for", id);
              // clear css
              var clearNode = domConstruct.create("div", {
                className: this.css.clear
              }, titleContainerNode);
              // optional custom content
              var customContentNode;
              if (layerInfo.customContentId) {
                customContentNode = domConstruct.create("div", {
                  id: layerInfo.customContentId,
                  className: this.css.customContent
                }, titleNode);
              }
              // lets save all the nodes for events
              var nodesObj = {
                checkbox: checkboxNode,
                title: titleNode,
                titleContainer: titleContainerNode,
                label: labelNode,
                layer: layerNode,
                clear: clearNode,
                settings: settingsNode,
                customContent: customContentNode,
                subNodes: subNodes
              };
              this._nodes[layerIndex] = nodesObj;
              if (layer) {
                // subLayers from thier info. Also WMS layers
                subLayers = layer.layerInfos;
                // KML subLayers
                if (layerType === "KML") {
                  subLayers = layer.folders;
                }
                // if we have more than one subLayer and layer is of valid type for subLayers
                if (this.subLayers && layerType !== "ArcGISTiledMapServiceLayer" && subLayers && subLayers.length) {
                  // create subLayer list
                  var subListNode = domConstruct.create("ul", {
                    className: this.css.subList
                  }, layerNode);
                  // create each subLayer item
                  for (var j = 0; j < subLayers.length; j++) {
                    // subLayer info
                    var subLayer = subLayers[j];
                    var subLayerIndex;
                    var parentId = -1;
                    // Dynamic Map Service
                    if (layerType === "ArcGISMapServiceLayer") {
                      subLayerIndex = subLayer.id;
                      parentId = subLayer.parentLayerId;
                    }
                    // KML
                    else if (layerType === "KML") {
                      subLayerIndex = subLayer.id;
                      parentId = subLayer.parentFolderId;
                    }
                    // WMS
                    else if (layerType === "WMS") {
                      subLayerIndex = subLayer.name;
                      parentId = -1;
                    }
                    // place subLayers not in the root
                    if (parentId !== -1) {
                      subListNode = domConstruct.create("ul", {
                        className: this.css.subList
                      }, this._nodes[layerIndex].subNodes[parentId].subLayer);
                    }
                    // default checked state
                    var subChecked = this._subCheckboxStatus(layerInfo, subLayer);
                    var subId = this.id + "_checkbox_sub_" + layerIndex + "_" + subLayerIndex;
                    // list item node
                    var subLayerNode = domConstruct.create("li", {
                      className: this.css.subListLayer
                    }, subListNode);
                    // title of subLayer layer
                    var subTitleNode = domConstruct.create("div", {
                      className: this.css.title
                    }, subLayerNode);
                    // subLayer title container
                    var subTitleContainerNode = domConstruct.create("div", {
                      className: this.css.titleContainer
                    }, subTitleNode);
                    // subLayer checkbox
                    var subCheckboxNode = domConstruct.create("input", {
                      type: "checkbox",
                      id: subId,
                      "data-layer-index": layerIndex,
                      "data-sublayer-index": subLayerIndex,
                      className: this.css.checkbox
                    }, subTitleContainerNode);
                    domAttr.set(subCheckboxNode, "checked", subChecked);
                    // subLayer Title text
                    var subTitle = subLayer.name || "";
                    var subLabelNode = domConstruct.create("label", {
                      className: this.css.label,
                      textContent: subTitle
                    }, subTitleContainerNode);
                    domAttr.set(subLabelNode, "for", subId);
                    // subLayer clear css
                    var subClearNode = domConstruct.create("div", {
                      className: this.css.clear
                    }, subTitleContainerNode);
                    // object of subLayer nodes
                    var subNode = {
                      subList: subListNode,
                      subLayer: subLayerNode,
                      subTitle: subTitleNode,
                      subTitleContainer: subTitleContainerNode,
                      subCheckbox: subCheckboxNode,
                      subLabel: subLabelNode,
                      subClear: subClearNode
                    };
                    // add node to array
                    subNodes[subLayerIndex] = subNode;
                  }
                }
              }
            }
          }
        }
      },

      _removeEvents: function () {
        var i;
        // layer visibility events
        if (this._layerEvents && this._layerEvents.length) {
          for (i = 0; i < this._layerEvents.length; i++) {
            this._layerEvents[i].remove();
          }
        }
        this._layerEvents = [];
      },

      _setMapEvents: function () {
        this.own(on(this.map, "layer-add", lang.hitch(this, function () {
          this.refresh();
        })));
        this.own(on(this.map, "layer-remove", lang.hitch(this, function () {
          this.refresh();
        })));
      },

      _toggleVisible: function (index, subIndex, visible) {
        // if its a sublayer
        if (subIndex !== null) {
          // update checkbox and layer visibility classes
          domAttr.set(this._nodes[index].subNodes[subIndex].subCheckbox, "checked", visible);
        }
        // parent layer
        else {
          // update checkbox and layer visibility classes
          domAttr.set(this._nodes[index].checkbox, "checked", visible);
        }
        // emit event
        this.emit("toggle", {
          layerIndex: index,
          subLayerIndex: subIndex,
          visible: visible
        });
      },

      // todo 3.0: out of scale range for sublayers
      _layerVisChangeEvent: function (response, featureCollection, subLayerIndex) {
        var layer;
        // layer is a feature collection
        if (featureCollection) {
          // all subLayers
          var fcLayers = response.layerInfo.featureCollection.layers;
          // current layer object to setup event for
          layer = fcLayers[subLayerIndex].layerObject;
        } else {
          // layer object for event
          layer = response.layer;
        }
        // layer visibility changes
        var visChange = on(layer, "visibility-change", lang.hitch(this, function (evt) {
          if (featureCollection) {
            this._featureCollectionVisible(response.layerIndex, evt.visible);
          } else {
            // update checkbox and layer visibility classes
            this._toggleVisible(response.layerIndex, null, evt.visible);
          }
        }));
        this._layerEvents.push(visChange);
        if (!featureCollection) {
          // scale visibility changes
          var scaleVisChange = on(layer, "scale-visibility-change", lang.hitch(this, function (evt) {
            var visible = evt.target.visibleAtMapScale;
            domClass.toggle(this._nodes[response.layerIndex].layer, this.css.layerScaleInvisible, !visible);
          }));
          this._layerEvents.push(scaleVisChange);
        }
      },

      _layerEvent: function (response) {
        var layerInfo = response.layerInfo;
        var layerType = layerInfo.layerType;
        var layerIndex = response.layerIndex;
        var layer = response.layer;
        // feature collection layer
        if (layerInfo.featureCollection && layerInfo.featureCollection.layers && layerInfo.featureCollection.layers.length) {
          // feature collection layers
          var fsLayers = layerInfo.featureCollection.layers;
          if (fsLayers && fsLayers.length) {
            // make event for each layer
            for (var i = 0; i < fsLayers.length; i++) {
              // layer visibility changes
              this._layerVisChangeEvent(response, true, i);
            }
          }
        } else {
          // layer visibility changes
          this._layerVisChangeEvent(response);
          // if we have a map service
          if (this.subLayers && layerType === "ArcGISMapServiceLayer") {
            var subVisChange = on(layer, "visible-layers-change", lang.hitch(this, function (evt) {
              // new visible layers
              var visibleLayers = evt.visibleLayers;
              // all subLayer info
              var layerInfos = layer.layerInfos;
              // go through all subLayers
              for (var i = 0; i < layerInfos.length; i++) {
                var subLayerIndex = layerInfos[i].id;
                // is subLayer in visible layers array
                var found = array.indexOf(visibleLayers, subLayerIndex);
                // not found
                if (found === -1) {
                  layerInfos[subLayerIndex].defaultVisibility = false;
                  this._toggleVisible(layerIndex, subLayerIndex, false);
                }
                // found
                else {
                  layerInfos[subLayerIndex].defaultVisibility = true;
                  this._toggleVisible(layerIndex, subLayerIndex, true);
                }
              }
            }));
            this._layerEvents.push(subVisChange);
          }
          // todo 3.0: need event for wms sublayer toggles
          // todo 3.0: need event for KML sublayer toggles
        }
      },

      _toggleLayer: function (layerIndex, subLayerIndex) {
        // all layers
        if (this.layers && this.layers.length) {
          var newVis;
          var layerInfo = this.layers[parseInt(layerIndex, 10)];
          var layerType = layerInfo.layerType;
          var layer = layerInfo.layerObject;
          var featureCollection = layerInfo.featureCollection;
          var visibleLayers;
          var i;
          // feature collection layer
          if (featureCollection) {
            // new visibility
            newVis = !layerInfo.visibility;
            // set visibility for layer reference
            layerInfo.visibility = newVis;
            // toggle all sub layers
            for (i = 0; i < featureCollection.layers.length; i++) {
              var fcLayer = featureCollection.layers[i].layerObject;
              // toggle to new visibility
              fcLayer.setVisibility(newVis);
            }
          }
          // layer
          else if (layer) {
            // we're toggling a sublayer
            if (subLayerIndex !== null) {
              // Map Service Layer
              if (layerType === "ArcGISMapServiceLayer") {
                subLayerIndex = parseInt(subLayerIndex, 10);
                var layerInfos = layer.layerInfos;
                // array for setting visible layers
                visibleLayers = [-1];
                newVis = !layerInfos[subLayerIndex].defaultVisibility;
                // reverse current visibility of sublayer
                layerInfos[subLayerIndex].defaultVisibility = newVis;
                // for each sublayer
                for (i = 0; i < layerInfos.length; i++) {
                  var info = layerInfos[i];
                  // push to visible layers if it's visible
                  if (info.defaultVisibility) {
                    visibleLayers.push(info.id);
                    var negative = array.lastIndexOf(visibleLayers, -1);
                    if (negative !== -1) {
                      visibleLayers.splice(negative, 1);
                    }
                  }
                }
                layer.setVisibleLayers(visibleLayers);
              }
              // KML Layer
              else if (layerType === "KML") {
                subLayerIndex = parseInt(subLayerIndex, 10);
                var folders = layer.folders;
                // for each sublayer
                for (i = 0; i < folders.length; i++) {
                  var folder = folders[i];
                  if (folder.id === subLayerIndex) {
                    layer.setFolderVisibility(folder, !folder.visible);
                    break;
                  }
                }
              } else if (layerType === "WMS") {
                visibleLayers = layer.visibleLayers;
                var found = array.indexOf(visibleLayers, subLayerIndex);
                if (found === -1) {
                  visibleLayers.push(subLayerIndex);
                } else {
                  visibleLayers.splice(found, 1);
                }
                layer.setVisibleLayers(visibleLayers);
              }
            }
            // parent map layer
            else {
              // reverse current visibility of parent layer
              newVis = !layer.visible;
              // new visibility of parent layer
              layerInfo.visibility = newVis;
              layer.setVisibility(newVis);
            }
          }
          // Just layer object
          else {
            newVis = !layerInfo.visible;
            layerInfo.setVisibility(newVis);
          }
        }
      },

      _featureCollectionVisible: function (index, visible) {
        var layer = this.layers[index];
        // all layers either visible or not
        var equal;
        // feature collection layers turned on by default
        var visibleLayers = layer.visibleLayers;
        // feature collection layers
        var layers = layer.featureCollection.layers;
        // if we have layers set
        if (visibleLayers && visibleLayers.length) {
          // check if all layers have same visibility
          equal = array.every(visibleLayers, function (item) {
            // check if current layer has same as first layer
            return layers[item].layerObject.visible === visible;
          });
        } else {
          // check if all layers have same visibility
          equal = array.every(layers, function (item) {
            // check if current layer has same as first layer
            return item.layerObject.visible === visible;
          });
        }
        // all are the same
        if (equal) {
          this._toggleVisible(index, null, visible);
        }
      },

      _setLayerEvents: function () {
        // this function sets up all the events for layers
        var layers = this._loadedLayers;
        if (layers && layers.length) {
          // get all layers
          for (var i = 0; i < layers.length; i++) {
            var response = layers[i];
            // create necessary events
            this._layerEvent(response);
          }
        }
      },

      _init: function () {
        this._visible();
        this.refresh().always(lang.hitch(this, function () {
          this._setMapEvents();
          this.set("loaded", true);
          this.emit("load", {});
        }));
      },

      _visible: function () {
        if (this.visible) {
          domStyle.set(this.domNode, "display", "block");
        } else {
          domStyle.set(this.domNode, "display", "none");
        }
      },

      /* stateful properties */

      _setThemeAttr: function (newVal) {
        domClass.remove(this.domNode, this.theme);
        domClass.add(this.domNode, newVal);
        this._set("theme", newVal);
      },

      _setMapAttr: function (newVal) {
        this._set("map", newVal);
        if (this._created) {
          this.refresh();
        }
      },

      _setLayersAttr: function (newVal) {
        this._set("layers", newVal);
        if (this._created) {
          this.refresh();
        }
      },

      _setVisibleAttr: function (newVal) {
        this._set("visible", newVal);
        if (this._created) {
          this._visible();
        }
      }

    });

  });