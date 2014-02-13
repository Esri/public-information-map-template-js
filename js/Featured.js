define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/on",
    "esri/geometry/Extent",
    "dojo/window"
],
    function (
        declare,
        lang,
        dom,
        domConstruct,
        domClass,
        on,
        Extent,
        win
    ) {
        return declare("", null, {
            initFeatured: function () {
                this.featuredCSS = {
                    noteContainer: 'note-container',
                    noteItem: 'note-item',
                    noteTitleText: 'note-text',
                    noteContent: 'note-content',
                    notePadding: 'note-padding',
                    noteSelected: 'note-selected',
                    noteImage: 'note-image',
                    noteLink: 'note-link',
                    noteExpand: 'note-expand',
                    noteLoading: 'note-loading',
                    bookmarkItem: 'bookmark-item',
                    clear: 'clear'
                };
                // insert bookmarks
                this._placeBookmarks();
                // insert map notes
                this._placeNotes();
                // description
                if (this.config.showSummary) {
                    this._setSummary(this.config.summary || this.item.snippet);
                }
            },
            _setSummary: function (description) {
                // map title node
                var node = dom.byId('summary');
                if (node) {
                    // set title
                    node.innerHTML = description;
                }
            },
            _placeNotes: function(){
                // get note layers from the one layer id or title
                this._notesLayers = this._getNotesLayers({
                    map: this.map,
                    layers: this.layers,
                    notesLayer: this.config.notesLayer
                });
                // event for each layer
                this._noteLayerEvents();
                // update note layer title
                this._setNoteLayerTitle();
                // place items to click
                this._placeNoteItems();
            },
            _noteLayerEvent: function(layer){
                // on layer toggle
                on(layer, 'visibility-change', lang.hitch(this, function(){
                    // clear selected feature
                    if(this.map.infoWindow){
                        this.map.infoWindow.clearFeatures();   
                    } 
                }));
            },
            _noteLayerEvents: function(){
                // each note event
                if(this._notesLayers.length){
                    for(var i = 0; i < this._notesLayers.length; i++){
                        var layer = this._notesLayers[i];
                        this._noteLayerEvent(layer);
                    }
                }
            },
            _setNoteLayerTitle: function(){
                // set title of header to layer title
                if(this._notesLayerTitle){
                    var node = dom.byId('map_notes_title');
                    if(node){
                        node.innerHTML = this._notesLayerTitle;
                    }
                }  
            },
            _placeNoteItems: function(){
                this.noteNodes = [];
                this.noteGraphics = [];
                this.noteGeometries = [];
                this.noteCount = 0;
                var notesNode = dom.byId('featured_notes');
                if(notesNode){
                    // if we have note layers
                    if(this._notesLayers.length){
                        // each note layer
                        for(var i = 0; i < this._notesLayers.length; i++){
                            // hide info window for map notes layers
                            if(this.config.hideNotesLayerPopups){
                                this._notesLayers[i].setInfoTemplate(null);
                            }
                            // get graphics from layer
                            for(var j = 0; j < this._notesLayers[i].graphics.length; j++){
                                // note graphic
                                var graphic = this._notesLayers[i].graphics[j];
                                var attributes = this._notesLayers[i].graphics[j].attributes;
                                var geometry = this._notesLayers[i].graphics[j].geometry;
                                // save references
                                this.noteGeometries.push(geometry);
                                this.noteGraphics.push(graphic);
                                // note container
                                var containerNode = domConstruct.create('div', {
                                    className: this.featuredCSS.noteContainer
                                });
                                // text symbol
                                if(graphic.symbol.type === 'textsymbol'){
                                    attributes.TITLE = graphic.symbol.text;
                                }
                                // note title
                                var titleNode = domConstruct.create('div', {
                                    className: this.featuredCSS.noteItem
                                });
                                domConstruct.place(titleNode, containerNode, 'last');
                                // note title
                                var noteTitleText = domConstruct.create('div', {
                                    innerHTML: attributes.TITLE || this.config.i18n.featured.untitledNote,
                                    className: this.featuredCSS.noteTitleText
                                });
                                domConstruct.place(noteTitleText, titleNode, 'last');
                                // note title
                                var noteExpand = domConstruct.create('div', {
                                    className: this.featuredCSS.noteExpand
                                });
                                domConstruct.place(noteExpand, titleNode, 'last');
                                // note title
                                var clear = domConstruct.create('div', {
                                    className: this.featuredCSS.clear
                                });
                                domConstruct.place(clear, titleNode, 'last');
                                // note HTML
                                var noteContent = '';
                                if (attributes.DESCRIPTION) {
                                    noteContent = attributes.DESCRIPTION + "\n";
                                }
                                // if it has an image
                                if (attributes.IMAGE_URL) {
                                    // image has link
                                    if (attributes.IMAGE_LINK_URL) {
                                        noteContent += '<a class="' + this.featuredCSS.noteLink + '" target="_blank" href="' + attributes.IMAGE_LINK_URL + '"><image class="' + this.featuredCSS.noteImage + '" src= "' + attributes.IMAGE_URL + '" alt="' + attributes.TITLE + '" /></a>';
                                    }
                                    else {
                                        noteContent += '<image class="' + this.featuredCSS.noteImage + '" src="' + attributes.IMAGE_URL + '" alt="' + attributes.TITLE + '" />';
                                    }
                                }
                                // if no content was set
                                if(!noteContent){
                                    noteContent = this.config.i18n.featured.notesUnavailable;
                                }
                                // note content
                                var contentNode = domConstruct.create('div', {  
                                    className: this.featuredCSS.noteContent,
                                    innerHTML: '<div class="' + this.featuredCSS.notePadding + '">' + noteContent + '</div>'
                                });
                                domConstruct.place(contentNode, containerNode, 'last');
                                // store nodes
                                this.noteNodes.push({
                                    containerNode: containerNode,
                                    titleNode: titleNode,
                                    noteTitleText: noteTitleText,
                                    noteExpand: noteExpand,
                                    contentNode: contentNode
                                });
                                // note event
                                this._noteEvent(this.noteCount);
                                // insert node
                                domConstruct.place(containerNode, notesNode, 'last');
                                // keep score!
                                this.noteCount++;
                            }
                        } 
                    }
                }
            },
            // get layer
            _getNotesLayers: function (obj) {
                // get the layer by ID or title
                var mapLayer, mapLayers = [], layers, layer, i, j;
                // if we have a layer id
                if (obj.notesLayer && obj.notesLayer.id) {
                    for (i = 0; i < obj.layers.length; i++) {
                        layer = obj.layers[i];
                        if (layer.id === obj.notesLayer.id) {
                            this._noteLayerObj = layer;
                            this._notesLayerTitle = layer.title;
                            layers = layer.featureCollection.layers;
                            for(j = 0; j < layers.length; j++){
                                mapLayer = obj.map.getLayer(layers[j].id);
                                if(mapLayer){
                                    mapLayers.push(mapLayer);
                                }
                            }
                            break;
                        }
                    }
                }
                return mapLayers;
            },
            _noteEvent: function(idx){
                on(this.noteNodes[idx].titleNode, 'click', lang.hitch(this, function(){
                    // if note open
                    if(domClass.contains(this.noteNodes[idx].containerNode, this.featuredCSS.noteSelected)){
                        // close note
                        domClass.toggle(this.noteNodes[idx].containerNode, this.featuredCSS.noteSelected);
                        // clear selected feature
                        if(this.map.infoWindow){
                            this.map.infoWindow.clearFeatures();   
                        }
                        // dont do any more
                        return;
                    }
                    else{
                        // close selected notes
                        for(var i = 0; i < this.noteNodes.length; i++){
                            domClass.remove(this.noteNodes[i].containerNode, this.featuredCSS.noteSelected);
                            // remove any loading
                            domClass.remove(this.noteNodes[i].titleNode, this.featuredCSS.noteLoading);
                        }
                        // open note
                        domClass.toggle(this.noteNodes[idx].containerNode, this.featuredCSS.noteSelected);
                    }
                    var geometry = this.noteGeometries[idx];
                    var extent;
                    switch(geometry.type){
                        case "point":
                            extent = this.map.extent.centerAt(geometry);
                            break;
                        default:
                            extent = geometry.getExtent();
                    }
                    var vs = win.getBox();
                    if (vs.w < this._showDrawerSize) {
                        this._drawer.toggle().then(lang.hitch(this, function () {
                            // resize map
                            this.map.resize(true);
                            // wait for map to be resized
                            setTimeout(lang.hitch(this, function () {
                                this._setNoteExtent(idx, extent);
                            }), 250);
                        }));
                    } else {
                        this._setNoteExtent(idx, extent);
                    }
                }));
            },
            _turnOnNoteLayers: function(){
                if(this._notesLayers.length){
                    for(var i = 0; i < this._notesLayers.length; i++){
                        var layer = this._notesLayers[i];
                        layer.show();
                    }
                    this._noteLayerObj.visibility = true;
                }
            },
            _setNoteExtent: function(idx, extent){
                this._turnOnNoteLayers();
                domClass.add(this.noteNodes[idx].titleNode, this.featuredCSS.noteLoading);
                this.map.setExtent(extent, true).then(lang.hitch(this, function(){
                    // select graphic
                    if(this.map.infoWindow){
                        this.map.infoWindow.set("popupWindow", false);
                        this.map.infoWindow.setFeatures([this.noteGraphics[idx]]);
                        this.map.infoWindow.show(extent.getCenter());
                        this.map.infoWindow.set("popupWindow", true);
                    }
                    domClass.remove(this.noteNodes[idx].titleNode, this.featuredCSS.noteLoading);
                }));
            },
            _setBookmarkExtent: function(idx, extent){
                domClass.add(this.bmNodes[idx], this.featuredCSS.noteLoading);
                this.map.setExtent(extent).then(lang.hitch(this, function(){
                    domClass.remove(this.bmNodes[idx], this.featuredCSS.noteLoading);
                }));
            },
            _bookmarkEvent: function(idx){
                on(this.bmNodes[idx], 'click', lang.hitch(this, function(){
                    // remove any loading
                    for(var i = 0; i < this.bmNodes.length; i++){
                        domClass.remove(this.bmNodes[i], this.featuredCSS.noteLoading);
                    }
                    var extent = new Extent(this.bookmarks[idx].extent);
                    var vs = win.getBox();
                    if (vs.w < this._showDrawerSize) {
                        this._drawer.toggle().then(lang.hitch(this, function () {
                            // resize map
                            this.map.resize(true);
                            // wait for map to be resized
                            setTimeout(lang.hitch(this, function () {
                                this._setBookmarkExtent(idx, extent);
                            }), 250);
                        }));
                    } else {
                        this._setBookmarkExtent(idx, extent);
                    }
                }));
            },
            _placeBookmarks: function(){
                var bookmarks = this.bookmarks;
                if (bookmarks && bookmarks.length){
                    var bookmarksNode = dom.byId('featured_bookmarks');
                    if(bookmarksNode){
                        this.bmNodes = [];
                        for(var i = 0; i < bookmarks.length; i++){
                            var node = domConstruct.create('div', {
                                innerHTML: bookmarks[i].name,
                                className: this.featuredCSS.bookmarkItem
                            });
                            this.bmNodes.push(node);
                            this._bookmarkEvent(i);
                            domConstruct.place(node, bookmarksNode, 'last');
                        }
                    }
                }
            }
        });
    });