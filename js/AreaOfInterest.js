define([
    "dojo/ready",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "esri/geometry/Extent",
],
    function (
        ready,
        declare,
        lang,
        dom,
        domConstruct,
        domStyle,
        on,
        Extent
    ) {
        return declare("", null, {

            initArea: function () {
                this._placeBookmarks();
                this._placeNotes();
            },
            _placeNotes: function(){
                this._notesLayers = this._getNotesLayers({
                    map: this.map,
                    layers: this.layers,
                    title: this.config.notes_layer_title,
                    id: this.config.notes_layer_id
                });
                if(this._notesLayers && this._notesLayers.length){
                    this._placeNoteItems();
                }
            },
            _placeNoteItems: function(){
                this.noteNodes = [];
                this.noteGeometries = [];
                var notesNode = dom.byId('area_notes');
                for(var i = 0; i < this._notesLayers.length; i++){
                    for(var j = 0; j < this._notesLayers[i].graphics.length; j++){
                        var attributes = this._notesLayers[i].graphics[j].attributes;
                        var geometry = this._notesLayers[i].graphics[j].geometry;
                        this.noteGeometries.push(geometry);
                        var node = domConstruct.create('div', {
                            innerHTML: attributes.TITLE,
                            className: this.css.areaItem
                        });
                        this.noteNodes.push(node);
                        this._noteEvent(this.noteNodes.length - 1);
                        domConstruct.place(node, notesNode, 'last');
                    }
                }  
            },
            // get layer
            _getNotesLayers: function (obj) {
                var mapLayer, mapLayers = [], layers, layer, i, j;
                // if we have a layer id
                if (obj.id) {
                    for (i = 0; i < obj.layers.length; i++) {
                        layer = obj.layers[i];
                        if (layer.id === obj.id) {
                            layers = layer.featureCollection.layers;
                            for(j = 0; j < layers.length; j++){
                                mapLayer = obj.map.getLayer(layers[j].id);
                                if(mapLayer){
                                    mapLayers.push(mapLayer);
                                }
                            }
                            return mapLayers;
                        }
                    }
                } else if (obj.title) {
                    // use layer title
                    for (i = 0; i < obj.layers.length; i++) {
                        layer = obj.layers[i];
                        if (layer.title.toLowerCase() === obj.title.toLowerCase()) {
                            layers = layer.featureCollection.layers;
                            for(j = 0; j < layers.length; j++){
                                mapLayer = obj.map.getLayer(layers[j].id);
                                if(mapLayer){
                                    mapLayers.push(mapLayer);
                                }
                            }
                            return mapLayers;
                        }
                    }
                }
                return false;
            },
            _noteEvent: function(idx){
                on(this.noteNodes[idx], 'click', lang.hitch(this, function(){
                    var geometry = this.noteGeometries[idx];
                    var extent;
                    switch(geometry.type){
                        case "point":
                            extent = this.map.extent.centerAt(geometry);
                            break;
                        default:
                            extent = geometry.getExtent();
                    }
                    this.map.setExtent(extent, true);
                }));
            },
            _bookmarkEvent: function(idx){
                on(this.bmNodes[idx], 'click', lang.hitch(this, function(){
                    var extent = new Extent(this.bookmarks[idx].extent);
                    this.map.setExtent(extent);
                }));
            },
            _placeBookmarks: function(){
                var bookmarks = this.bookmarks;
                if (bookmarks && bookmarks.length){
                    var bookmarksNode = dom.byId('area_bookmarks');
                    this.bmNodes = [];
                    for(var i = 0; i < bookmarks.length; i++){
                        var node = domConstruct.create('div', {
                            innerHTML: bookmarks[i].name,
                            className: this.css.areaItem
                        });
                        this.bmNodes.push(node);
                        this._bookmarkEvent(i);
                        domConstruct.place(node, bookmarksNode, 'last');
                    }
                }
            }
        });
    });