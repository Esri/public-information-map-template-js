define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dojo/on",
    "dojo/query",
    // load template    
    "dojo/text!modules/dijit/templates/LayerLegend.html",
    "dojo/i18n!modules/nls/LayerLegend",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "esri/dijit/Legend",
    "dojo/_base/event",
    "dojo/_base/array"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, _OnDijitClickMixin, _TemplatedMixin,
    on,
    query,
    dijitTemplate, i18n,
    domClass, domStyle, domConstruct,
    Legend,
    event,
    array
) {
    var Widget = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.LayerLegend",
        templateString: dijitTemplate,
        // defaults
        options: {
            theme: "LayerLegend",
            map: null,
            layers: null,
            visible: true,
            sublayers: false,
            zoomTo: false,
            accordion: true
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            declare.safeMixin(this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("map", this.options.map);
            this.set("layers", this.options.layers);
            this.set("theme", this.options.theme);
            this.set("visible", this.options.visible);
            this.set("sublayers", this.options.sublayers);
            this.set("zoomTo", this.options.zoomTo);
            this.set("accordion", this.options.accordion);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            this.watch("layers", this._refreshLayers);
            this.watch("sublayers", this.refresh);
            this.watch("map", this.refresh);
            this.watch("zoomTo", this.refresh);
            // classes
            this._css = {
                container: "LL_Container",
                layer: "LL_Layer",
                firstLayer: "LL_FirstLayer",
                legend: "LL_Legend",
                title: "LL_Title",
                titleContainer: "LL_TitleContainer",
                content: "LL_Content",
                titleCheckbox: "LL_Checkbox",
                checkboxCheck: "icon-check-1",
                titleText: "LL_Text",
                expanded: "LL_Expanded",
                visible: "LL_Visible",
                zoomTo: "LL_ZoomTo",
                sublayerContainer: "LL_SublayerContainer",
                sublayer: "LL_Sublayer",
                sublayerVisible: "LL_SublayerVisible",
                sublayerCheckbox: "LL_SublayerCheckbox",
                sublayerText: "LL_SublayerText"
            };
        },
        // start widget. called by user
        startup: function() {
            // map not defined
            if (!this.map) {
                this.destroy();
                console.log('LayerLegend::map required');
            }
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function() {
                    this._init();
                }));
            }
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this._removeEvents();
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // zoom-to
        // toggle
        // expand
        // collapse
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        show: function() {
            this.set("visible", true);
        },
        hide: function() {
            this.set("visible", false);
        },
        refresh: function() {
            this._createLegends();
        },
        expand: function(index){
            if(typeof index !== 'undefined'){
                // we want accordion affect
                if (this.get("accordion")) {
                    // remove all expanded 
                    var nodes = query('.' + this._css.expanded, this._layersNode);
                    for (var i = 0; i < nodes.length; i++) {
                        domClass.remove(nodes[i], this._css.expanded);
                    }
                    this._expanded = [];
                }
                // add index to expanded list
                var position = array.indexOf(this._expanded, index);
                if(position === -1){
                    this._expanded.push(index);
                }
                // add expanded class
                domClass.add(this._nodes[index].layer, this._css.expanded);
                // event
                this.emit("expand", {
                    index: index
                });
            }
        },
        collapse: function(index){
            if(typeof index !== 'undefined'){
                // remove index from expanded list
                var position = array.indexOf(this._expanded, index);
                if(position !== -1){
                    this._expanded.splice(position, 1);
                }
                // remove expanded class
                domClass.remove(this._nodes[index].layer, this._css.expanded);
                // event
                this.emit("collapse", {
                    index: index
                });
            }
        },
        toggle: function(index){
            if(typeof index !== 'undefined'){
                var expand = !domClass.contains(this._nodes[index].layer, this._css.expanded);
                // exp/col
                if(expand){
                    this.expand(index);
                }
                else{
                    this.collapse(index);
                }
                // event
                this.emit("toggle", {
                    expand: expand,
                    index: index
                });
            }
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _createLegends: function() {
            var layers = this.get("layers");
            this._nodes = [];
            // kill events
            this._removeEvents();
            // clear node
            this._layersNode.innerHTML = '';
            // Set default expanded to last index
            if(!this._expanded){
                this._expanded = [layers.length - 1];
            }
            // if we got layers
            if (layers && layers.length) {
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    var layerInfos;
                    var sublayers;
                    var titleCheckBoxClass = this._css.titleCheckbox;
                    var layerClass = this._css.layer;
                    var sublayerNodes = [];
                    if (layer.layerObject) {
                        layerInfos = layer.layerObject.layerInfos;
                        if (this.get("sublayers") && layerInfos && layerInfos.length) {
                            sublayers = layer.layerObject.layerInfos;
                        }
                    }
                    if (i === (layers.length - 1)) {
                        layerClass += ' ';
                        layerClass += this._css.firstLayer;
                    }
                    // set expanded list item
                    var position = array.indexOf(this._expanded, i);
                    if(position !== -1){
                        layerClass += ' ';
                        layerClass += this._css.expanded;
                    }
                    if (layer.visibility) {
                        layerClass += ' ';
                        layerClass += this._css.visible;
                        titleCheckBoxClass += ' ';
                        titleCheckBoxClass += this._css.checkboxCheck;
                    }
                    // layer node
                    var layerDiv = domConstruct.create("div", {
                        className: layerClass
                    });
                    domConstruct.place(layerDiv, this._layersNode, "first");
                    // title of layer
                    var titleDiv = domConstruct.create("div", {
                        className: this._css.title,
                    });
                    domConstruct.place(titleDiv, layerDiv, "last");
                    // title container
                    var titleContainerDiv = domConstruct.create("div", {
                        className: this._css.titleContainer,
                    });
                    domConstruct.place(titleContainerDiv, titleDiv, "last");
                    // Title checkbox
                    var titleCheckbox = domConstruct.create("span", {
                        className: titleCheckBoxClass
                    });
                    domConstruct.place(titleCheckbox, titleContainerDiv, "last");
                    // Title text
                    var titleText = domConstruct.create("span", {
                        className: this._css.titleText,
                        title: layer.title,
                        innerHTML: layer.title
                    });
                    domConstruct.place(titleText, titleContainerDiv, "last");
                    // content of layer
                    var contentDiv = domConstruct.create("div", {
                        className: this._css.content
                    });
                    domConstruct.place(contentDiv, layerDiv, "last");
                    // legend
                    var legendDiv = domConstruct.create("div", {
                        className: this._css.legend
                    });
                    domConstruct.place(legendDiv, contentDiv, "first");
                    // if sublayer and not a tile service
                    if (sublayers && sublayers.length && !layer.layerObject.tileInfo) {
                        var sublayerContainerDiv = domConstruct.create("div", {
                            className: this._css.sublayerContainer
                        });
                        domConstruct.place(sublayerContainerDiv, contentDiv, "first");
                        for (var j = 0; j < sublayers.length; j++) {
                            var sublayer = sublayers[j];
                            var sublayerchecked = '';
                            var sublayerVisible = '';
                            if (sublayer.defaultVisibility) {
                                sublayerchecked = this._css.checkboxCheck;
                                sublayerVisible = this._css.sublayerVisible;
                            }
                            // sublayer
                            var sublayerDiv = domConstruct.create("div", {
                                className: this._css.sublayer + ' ' + sublayerVisible
                            });
                            domConstruct.place(sublayerDiv, sublayerContainerDiv, "last");
                            // sublayer checkbox
                            var sublayerCheckboxDiv = domConstruct.create("span", {
                                className: this._css.sublayerCheckbox + ' ' + sublayerchecked
                            });
                            domConstruct.place(sublayerCheckboxDiv, sublayerDiv, "last");
                            // sublayer text
                            var sublayerTextDiv = domConstruct.create("span", {
                                className: this._css.sublayerText,
                                title: sublayer.name,
                                innerHTML: sublayer.name
                            });
                            domConstruct.place(sublayerTextDiv, sublayerDiv, "last");
                            var sublayerObj = {
                                sublayerDiv: sublayerDiv,
                                sublayerCheckboxDiv: sublayerCheckboxDiv,
                                sublayerTextDiv: sublayerTextDiv
                            };
                            sublayerNodes.push(sublayerObj);
                        }
                    }
                    var fullExtentDiv;
                    if(this.get("zoomTo") && layer.layerObject && layer.layerObject.fullExtent){
                        // legend
                        fullExtentDiv = domConstruct.create("div", {
                            className: this._css.zoomTo,
                            innerHTML: this._i18n.LayerLegend.zoomTo
                        });
                        domConstruct.place(fullExtentDiv, contentDiv, "first");
                    }
                    // determine default symbol
                    var defaultSymbol;
                    try {
                        defaultSymbol = layer.layerObject.renderer.defaultSymbol;
                    } catch (error) {
                        try {
                            defaultSymbol = layer.featureCollection.layers[0].layerObject.rendererer.defaultSymbol;
                        } catch (error2) {
                            defaultSymbol = null;
                        }
                    }
                    // whether to show legend or not
                    var showLegend = true;
                    if (layer.featureCollection && layer.featureCollection.hasOwnProperty('showLegend')) {
                        showLegend = layer.featureCollection.showLegend;
                    }
                    if (showLegend) {
                        // create legend
                        var legend = new Legend({
                            map: this.get("map"),
                            layerInfos: [{
                                title: layer.title,
                                layer: layer.layerObject,
                                defaultSymbol: defaultSymbol
                            }]
                        }, legendDiv);
                        legend.startup();
                        this._legends.push(legend);
                    } else {
                        // no legend to create
                        legendDiv.innerHTML = this._i18n.LayerLegend.noLegend;
                    }
                    // lets save all the nodes for events
                    var nodesObj = {
                        sublayerNodes: sublayerNodes,
                        checkbox: titleCheckbox,
                        title: titleDiv,
                        titleContainer: titleContainerDiv,
                        titleText: titleText,
                        content: contentDiv,
                        legend: legendDiv,
                        layer: layerDiv,
                        fullExtent: fullExtentDiv
                    };
                    this._nodes.push(nodesObj);
                    // create click event
                    this._titleEvent(i);
                    // create click event
                    this._checkboxEvent(i);
                    // set up sublayer events
                    if (sublayerNodes && sublayerNodes.length) {
                        for (var k = 0; k < sublayerNodes.length; k++) {
                            // create click event
                            this._sublayerCheckboxEvent(i, k);
                        }
                    }
                }
                this._setLayerEvents();
            }
        },
        _refreshLayers: function(){
            this._expanded = null;
            this.refresh();
        },
        _removeEvents: function() {
            var i;
            // title click events
            if (this._titleEvents && this._titleEvents.length) {
                for (i = 0; i < this._titleEvents.length; i++) {
                    this._titleEvents[i].remove();
                }
            }
            // checkbox click events
            if (this._checkEvents && this._checkEvents.length) {
                for (i = 0; i < this._checkEvents.length; i++) {
                    this._checkEvents[i].remove();
                }
            }
            // layer visibility events
            if (this._layerEvents && this._layerEvents.length) {
                for (i = 0; i < this._layerEvents.length; i++) {
                    this._layerEvents[i].remove();
                }
            }
            // legend widgets
            if (this._legends && this._legends.length) {
                for (i = 0; i < this._legends.length; i++) {
                    this._legends[i].destroy();
                }
            }
            this._titleEvents = [];
            this._checkEvents = [];
            this._layerEvents = [];
            this._legends = [];
        },
        _toggleVisibleSublayer: function(layerIndex, sublayerIndex, visible) {
            // update checkbox and layer visibility classes
            domClass.toggle(this._nodes[layerIndex].sublayerNodes[sublayerIndex].sublayerDiv, this._css.sublayerVisible, visible);
            domClass.toggle(this._nodes[layerIndex].sublayerNodes[sublayerIndex].sublayerCheckboxDiv, this._css.checkboxCheck, visible);
        },
        _toggleVisible: function(index, visible) {
            // update checkbox and layer visibility classes
            domClass.toggle(this._nodes[index].layer, this._css.visible, visible);
            domClass.toggle(this._nodes[index].checkbox, this._css.checkboxCheck, visible);
        },
        _layerEvent: function(layer, index) {
            // layer visibility changes
            var visChange = on(layer, 'visibility-change', lang.hitch(this, function(evt) {
                // update checkbox and layer visibility classes
                this._toggleVisible(index, evt.visible);
            }));
            this._layerEvents.push(visChange);
        },
        _fullExtentEvent: function(layer, index){
            var fullExtent = on(this._nodes[index].fullExtent, 'click', lang.hitch(this, function() {
                this.map.setExtent(layer.fullExtent);
                this.emit("zoom-to", {
                    layer: layer,
                    fullExtent: layer.fullExtent,
                    index: index
                });
            }));
            this._layerEvents.push(fullExtent);
        },
        _setLayerEvents: function() {
            // this function sets up all the events for layers
            var layers = this.get("layers");
            if (layers && layers.length) {
                // get all layers
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    // if it is a feature collection with layers
                    if (layer.featureCollection && layer.featureCollection.layers && layer.featureCollection.layers.length) {
                        var fclayers = layer.featureCollection.layers;
                        for (var j = 0; j < fclayers.length; j++) {
                            var sublayerObject = fclayers[j].layerObject;
                            this._layerEvent(sublayerObject, i);
                        }
                    } else {
                        // 1 layer object
                        var layerObject = layer.layerObject;
                        this._layerEvent(layerObject, i);
                    }
                    if(this.get("zoomTo") && layer.layerObject && layer.layerObject.fullExtent){
                        this._fullExtentEvent(layer.layerObject, i);
                    }
                }
            }
        },
        _toggleLayer: function(layerIndex, sublayerIndex) {
            // all layers
            if (this.layers && this.layers.length) {
                var newVis;
                var layer = this.layers[layerIndex];
                var layerObject = layer.layerObject;
                var featureCollection = layer.featureCollection;
                if (featureCollection) {
                    newVis = !layer.visibility;
                    layer.visibility = newVis;
                    // toggle all feature collection layers
                    if (featureCollection.layers && featureCollection.layers.length) {
                        for (var i = 0; i < featureCollection.layers.length; i++) {
                            layerObject = featureCollection.layers[i].layerObject;
                            // toggle to new visibility
                            layerObject.setVisibility(newVis);
                        }
                    }
                } else {
                    if (layerObject) {
                        if (typeof sublayerIndex !== 'undefined' && layerObject.hasOwnProperty('visibleLayers')) {
                            // layers visible
                            var visibleLayers = layerObject.visibleLayers;
                            // remove -1 from visible layers if its there
                            var negative = array.lastIndexOf(visibleLayers, -1);
                            if (negative !== -1) {
                                visibleLayers.splice(negative, 1);
                            }
                            // find sublayer index in visible layers
                            var found = array.lastIndexOf(visibleLayers, sublayerIndex);
                            if (found !== -1) {
                                // found position
                                visibleLayers.splice(found, 1);
                                // set invisible
                                newVis = false;
                            } else {
                                // position not found
                                visibleLayers.push(sublayerIndex);
                                // set visible
                                newVis = true;
                            }
                            // if visible layers is empty we need -1 in there
                            if (visibleLayers.length === 0) {
                                visibleLayers.push(-1);
                            }
                            layer.visibility = newVis;
                            // toggle checkbox
                            this._toggleVisibleSublayer(layerIndex, sublayerIndex, newVis);
                            // update visible
                            layerObject.setVisibleLayers(visibleLayers);
                            // refresh legend widget
                            this._legends[layerIndex].refresh();
                        } else {
                            newVis = !layer.layerObject.visible;
                            layer.visibility = newVis;
                            layerObject.setVisibility(newVis);
                        }
                    }
                }
            }
        },
        _sublayerCheckboxEvent: function(layerIndex, sublayerIndex) {
            // when checkbox is clicked
            var checkEvent = on(this._nodes[layerIndex].sublayerNodes[sublayerIndex].sublayerCheckboxDiv, 'click', lang.hitch(this, function(evt) {
                // update visible layers for this layer with sublayer
                this._toggleLayer(layerIndex, sublayerIndex);
                event.stop(evt);
            }));
            this._checkEvents.push(checkEvent);
        },
        _checkboxEvent: function(index) {
            // when checkbox is clicked
            var checkEvent = on(this._nodes[index].checkbox, 'click', lang.hitch(this, function(evt) {
                // toggle layer visibility
                this._toggleLayer(index);
                event.stop(evt);
            }));
            this._checkEvents.push(checkEvent);
        },
        _titleEvent: function(index) {
            // when a title of a layer has been clicked
            var titleEvent = on(this._nodes[index].title, 'click', lang.hitch(this, function() {
                this.toggle(index);
            }));
            this._titleEvents.push(titleEvent);
        },
        _init: function() {
            this._visible();
            this._createLegends();
            this.set("loaded", true);
            this.emit("load", {});
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            domClass.remove(this.domNode, oldVal);
            domClass.add(this.domNode, newVal);
        },
        _visible: function() {
            if (this.get("visible")) {
                domStyle.set(this.domNode, 'display', 'block');
            } else {
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.LayerLegend", Widget, esriNS);
    }
    return Widget;
});