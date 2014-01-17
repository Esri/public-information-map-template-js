define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/on",
    // load template    
    "dojo/text!modules/dijit/templates/TableOfContents.html",
    "dojo/i18n!modules/nls/TableOfContents",
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
    _WidgetBase, _TemplatedMixin,
    on,
    dijitTemplate, i18n,
    domClass, domStyle, domConstruct,
    Legend,
    event,
    array
) {
    var Widget = declare([_WidgetBase, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.TableOfContents",
        templateString: dijitTemplate,
        // defaults
        options: {
            theme: "TableOfContents",
            map: null,
            layers: null,
            visible: true,
            accordion: true,
            expandFirstOnStart: false,
            setVisibleOnExpand: true,
            expandAllOnStart: false
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("map", defaults.map);
            this.set("layers", defaults.layers);
            this.set("theme", defaults.theme);
            this.set("visible", defaults.visible);
            this.set("accordion", defaults.accordion);
            this.set("expandFirstOnStart", defaults.expandFirstOnStart);
            this.set("expandAllOnStart", defaults.expandAllOnStart);
            this.set("setVisibleOnExpand", defaults.setVisibleOnExpand);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            this.watch("layers", this._refreshLayers);
            this.watch("map", this.refresh);
            // classes
            this.css = {
                container: "toc-container",
                layer: "toc-layer",
                firstLayer: "toc-first-layer",
                legend: "toc-legend",
                title: "toc-title",
                titleContainer: "toc-title-container",
                content: "toc-content",
                titleCheckbox: "toc-checkbox",
                checkboxCheck: "icon-check-1",
                titleText: "toc-text",
                expanded: "toc-expanded",
                visible: "toc-visible",
                settingsIcon: "icon-cog"
            };
            // expanded array
            this._expanded = [];
        },
        // start widget. called by user
        startup: function() {
            // map not defined
            if (!this.map) {
                this.destroy();
                console.log('TableOfContents::map required');
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
                if (this.get("accordion")) {
                    // we want accordion affect
                    this._accordionEffect();
                }
                // add index to expanded list
                var position = array.indexOf(this._expanded, index);
                if(position === -1){
                    this._expanded.push(index);
                }
                // add expanded class
                domClass.add(this._nodes[index].layer, this.css.expanded);
                // show layer if it's not visible
                var layers = this.get("layers");
                if(this.get("setVisibleOnExpand") && layers[index] && !layers[index].visibility){
                    this._toggleLayer(index);
                }
                // event
                this.emit("expand", {
                    index: index
                });
            }
        },
        collapse: function(index){
            if(typeof index !== 'undefined'){
                if (this.get("accordion")) {
                    this._accordionEffect();
                }
                else{
                    // remove index from expanded list
                    var position = array.indexOf(this._expanded, index);
                    if(position !== -1){
                        this._expanded.splice(position, 1);
                    }
                    // remove expanded class
                    domClass.remove(this._nodes[index].layer, this.css.expanded);   
                }
                // event
                this.emit("collapse", {
                    index: index
                });
            }
        },
        toggle: function(index){
            if(typeof index !== 'undefined'){
                var expand = !domClass.contains(this._nodes[index].layer, this.css.expanded);
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
        _accordionEffect: function(){
            // remove all expanded 
            for (var i = 0; i < this._nodes.length; i++) {
                domClass.remove(this._nodes[i].layer, this.css.expanded);
            }
            this._expanded = [];
        },
        _createLegends: function() {
            var layers = this.get("layers");
            this._nodes = [];
            // kill events
            this._removeEvents();
            // clear node
            this._layersNode.innerHTML = '';
            if(this.get("expandFirstOnStart")){
                // Set default expanded to last indexexpan
                if(!this._expanded){
                    this._expanded = [layers.length - 1];
                }
            }
            // if we got layers
            if (layers && layers.length) {
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    // legend layer infos
                    var layerInfos = [];
                    // show legend
                    var showLegend = true;
                    // checkbox class
                    var titleCheckBoxClass = this.css.titleCheckbox;
                    // layer class
                    var layerClass = this.css.layer;
                    // first layer
                    if (i === (layers.length - 1)) {
                        layerClass += ' ';
                        layerClass += this.css.firstLayer;
                    }
                    // set expanded list item
                    var position = array.indexOf(this._expanded, i);
                    if(position !== -1 || this.get("expandAllOnStart")){
                        layerClass += ' ';
                        layerClass += this.css.expanded;
                    }
                    if (layer.visibility) {
                        layerClass += ' ';
                        layerClass += this.css.visible;
                        titleCheckBoxClass += ' ';
                        titleCheckBoxClass += this.css.checkboxCheck;
                    }
                    // layer node
                    var layerDiv = domConstruct.create("div", {
                        className: layerClass
                    });
                    domConstruct.place(layerDiv, this._layersNode, "first");
                    // title of layer
                    var titleDiv = domConstruct.create("div", {
                        className: this.css.title
                    });
                    domConstruct.place(titleDiv, layerDiv, "last");
                    // title container
                    var titleContainerDiv = domConstruct.create("div", {
                        className: this.css.titleContainer
                    });
                    domConstruct.place(titleContainerDiv, titleDiv, "last");
                    // Title checkbox
                    var titleCheckbox = domConstruct.create("span", {
                        className: titleCheckBoxClass
                    });
                    domConstruct.place(titleCheckbox, titleContainerDiv, "last");
                    // Title text
                    var titleText = domConstruct.create("span", {
                        className: this.css.titleText,
                        title: layer.title,
                        innerHTML: layer.title
                    });
                    domConstruct.place(titleText, titleContainerDiv, "last");
                    // settings icon
                    var settingsIcon;
                    if(layer.settingsIcon){
                        settingsIcon = domConstruct.create("span", {
                            className: this.css.settingsIcon,
                            id: layer.settingsIconId
                        });
                        domConstruct.place(settingsIcon, titleText, "last");
                    }
                    // content of layer
                    var contentDiv = domConstruct.create("div", {
                        className: this.css.content
                    });
                    domConstruct.place(contentDiv, layerDiv, "last");
                    // legend
                    var legendDiv = domConstruct.create("div", {
                        className: this.css.legend
                    });
                    domConstruct.place(legendDiv, contentDiv, "first");
                    // custom content
                    if(layer.content){
                        domConstruct.place(layer.content, contentDiv, "first");    
                    }
                    // client side layer
                    if (layer.featureCollection) {
                        // show legend defined
                        if(layer.featureCollection.hasOwnProperty('showLegend')){
                            showLegend = layer.featureCollection.showLegend;   
                        }
                        // each client side layer
                        for(var k = 0; k < layer.featureCollection.layers.length; k++){
                            // add layer info
                            layerInfos.push({
                                title: layer.featureCollection.layers[k].layerObject.name,
                                layer: layer.featureCollection.layers[k].layerObject
                            });
                        }
                    }
                    else if (layer.layerObject) {
                        layerInfos.push({
                            title: layer.title,
                            layer: layer.layerObject
                        });
                    }
                    // can we show legend?
                    if (showLegend) {
                        // create legend
                        var legend = new Legend({
                            map: this.get("map"),
                            layerInfos: layerInfos
                        }, legendDiv);
                        legend.startup();
                        this._legends.push(legend);
                    } else {
                        // no legend to create
                        legendDiv.innerHTML = this._i18n.TableOfContents.noLegend;
                    }
                    // lets save all the nodes for events
                    var nodesObj = {
                        checkbox: titleCheckbox,
                        title: titleDiv,
                        titleContainer: titleContainerDiv,
                        titleText: titleText,
                        settingsIcon: settingsIcon,
                        content: contentDiv,
                        legend: legendDiv,
                        layer: layerDiv
                    };
                    this._nodes.push(nodesObj);
                    // create click event
                    this._titleEvent(i);
                    // create click event
                    this._checkboxEvent(i);
                }
                this._setLayerEvents();
            }
        },
        _refreshLayers: function(){
            this._expanded = [];
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
        _toggleVisible: function(index, visible) {
            // update checkbox and layer visibility classes
            domClass.toggle(this._nodes[index].layer, this.css.visible, visible);
            domClass.toggle(this._nodes[index].checkbox, this.css.checkboxCheck, visible);
        },
        _layerEvent: function(layer, index) {
            // layer visibility changes
            var visChange = on(layer, 'visibility-change', lang.hitch(this, function(evt) {
                // update checkbox and layer visibility classes
                this._toggleVisible(index, evt.visible);
            }));
            this._layerEvents.push(visChange);
        },
        _featureCollectionVisible: function(layer, index, visible){
            // all layers either visible or not
            var equal;
            // feature collection layers turned on by default
            var visibleLayers = layer.visibleLayers;
            // feature collection layers
            var layers = layer.featureCollection.layers;
            // if we have layers set
            if(visibleLayers && visibleLayers.length){
                // check if all layers have same visibility
                equal = array.every(visibleLayers, function(item){
                    // check if current layer has same as first layer
                    return layers[item].layerObject.visible === visible;
                });
            }
            else {
                // check if all layers have same visibility
                equal = array.every(layers, function(item){
                    // check if current layer has same as first layer
                    return item.layerObject.visible === visible;
                });
            }
            // all are the same
            if(equal){
                this._toggleVisible(index, visible);
            }
        },
        _createFeatureLayerEvent: function(layer, index, i){
            var layers = layer.featureCollection.layers;
            // layer visibility changes
            var visChange = on(layers[i].layerObject, 'visibility-change', lang.hitch(this, function(evt) {
                var visible = evt.visible;
                this._featureCollectionVisible(layer, index, visible);
            }));
            this._layerEvents.push(visChange);
        },
        _featureLayerEvent: function(layer, index){
            // feature collection layers
            var layers = layer.featureCollection.layers;
            if(layers && layers.length){
                // make event for each layer
                for(var i = 0; i < layers.length; i++){
                    this._createFeatureLayerEvent(layer, index, i);
                }
            }
        },
        _setLayerEvents: function() {
            // this function sets up all the events for layers
            var layers = this.get("layers");
            var layerObject;
            if (layers && layers.length) {
                // get all layers
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    // if it is a feature collection with layers
                    if (layer.featureCollection && layer.featureCollection.layers && layer.featureCollection.layers.length) {
                        this._featureLayerEvent(layer, i);
                    } else {
                        // 1 layer object
                        layerObject = layer.layerObject;
                        this._layerEvent(layerObject, i);
                    }
                }
            }
        },
        _toggleLayer: function(layerIndex) {
            // all layers
            if (this.layers && this.layers.length) {
                var newVis;
                var layer = this.layers[layerIndex];
                var layerObject = layer.layerObject;
                var featureCollection = layer.featureCollection;
                var visibleLayers;
                var i;
                if (featureCollection) {
                    // visible feature layers
                    visibleLayers = layer.visibleLayers;
                    // new visibility
                    newVis = !layer.visibility;
                    // set visibility for layer reference
                    layer.visibility = newVis;
                    // toggle all feature collection layers
                    if (visibleLayers && visibleLayers.length) {
                        // toggle visible sub layers
                        for (i = 0; i < visibleLayers.length; i++) {
                            layerObject = featureCollection.layers[visibleLayers[i]].layerObject;
                            // toggle to new visibility
                            layerObject.setVisibility(newVis);
                        }
                    }
                    else{
                        // toggle all sub layers
                        for (i = 0; i < featureCollection.layers.length; i++) {
                            layerObject = featureCollection.layers[i].layerObject;
                            // toggle to new visibility
                            layerObject.setVisibility(newVis);
                        } 
                    }
                } else if(layerObject) {
                    newVis = !layer.layerObject.visible;
                    layer.visibility = newVis;
                    layerObject.setVisibility(newVis);
                }
            }
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
        lang.setObject("dijit.TableOfContents", Widget, esriNS);
    }
    return Widget;
});