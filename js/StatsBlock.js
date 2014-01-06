define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/on",
    // load template
    "dojo/text!modules/dijit/templates/StatsBlock.html",
    "dojo/i18n!modules/nls/StatsBlock",
    "dojo/number",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-geometry"
],
function (
    Evented,
    declare,
    lang, array,
    has, esriNS,
    _WidgetBase, _TemplatedMixin,
    on,
    dijitTemplate, i18n,
    number,
    domConstruct, domClass, domStyle, domGeom
) {
    var Widget = declare([_WidgetBase, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.StatsBlock",
        templateString: dijitTemplate,
        options: {
            features: null,
            config: null,
            stats: null
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            this.set("features", defaults.features);
            this.set("config", defaults.config);
            this.set("stats", defaults.stats);
            this.watch("features", this._displayStats);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // classes
            this.css = {
                geoPanel: 'geoPanel',
                geoDataContainer: 'geodata-container',
                geoPanelExpanded: 'panel-expanded-container',
                stats: 'geoData',
                statsOpen: 'geoDataExpanded',
                statsPanel: 'panel',
                StatsPanelParent: 'panel-parent',
                statsCount: 'count',
                statsTitle: "title",
                statsPanelSelected: 'panel-expanded',
                statsPanelDataBlock: 'data-block',
                statsPanelDataBlockLast: 'data-block-last',
                statsSourceInfo: 'icon-info-circled-1',
                animateSlider: "animateSlider",
                divOuterSliderContainer: "divOuterSliderContainer",
                divHeader: "divHeader",
                bgColor: "bgColor",
                hTitle: "hTitle",
                hNumber: "hNumber",
                divHeaderTitle: "divHeaderTitle",
                divGeoDataHolder: "divGeoDataHolder",
                divHeaderClose: "divHeaderClose",
                iconCancel: "icon-cancel-1",
                divSliderContainer: "divSliderContainer",
                dataSourceUrl: "dataSourceUrl",
                divInnerSliderContainer: "divInnerSliderContainer",
                divLeft: "divLeft",
                divRight: "divRight",
                leftArrow: "leftArrow",
                rightArrow: "rightArrow",
                disableArrow: "disableArrow",
                divSliderContent: "divSliderContent",
                carousel: "carousel",
                slidePanel: "slidePanel",
                divPaginationContainer: "divPaginationContainer",
                divPagination: "divPagination",
                paginationDot: "paginationDot",                
                clear: "clear"
            };
            //set no of slide to display
            this.displayPageCount = 3;
            this.blockThemes = ['theme_1', 'theme_2', 'theme_3', 'theme_4'];
            this._selectedPageIndex = [];
        },
        // start widget. called by user
        startup: function() {
            this._init();
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this._removeEvents();
            this._removeWidgetEvents();
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        resize: function() {
            this._resizeSliders();
            this._setPanelWidth();
        },
        show: function() {
            domStyle.set(this.domNode, 'display', 'block');
        },
        hide: function() {
            domStyle.set(this.domNode, 'display', 'none');
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _removeEvents: function() {
            if (this._events && this._events.length) {
                for (var i = 0; i < this._events.length; i++) {
                    this._events[i].remove();
                }
            }
            this._events = [];
        },
        _removeWidgetEvents: function() {
            if (this._widgetEvents && this._widgetEvents.length) {
                for (var i = 0; i < this._widgetEvents.length; i++) {
                    this._widgetEvents[i].remove();
                }
            }
            this._widgetEvents = [];
        },
        _init: function() {
            // remove widget events
            this._removeWidgetEvents();
            // window resize event
            var winResize = on(window, 'resize', lang.hitch(this, function() {
                this.resize();
            }));
            this._widgetEvents.push(winResize);
            // setup events
            this._displayStats();
            // ready
            this.set("loaded", true);
            this.emit("load", {});
        },
        _formatNumber: function(n, decPlaces) {
            // format large numbers
            decPlaces = Math.pow(10, decPlaces);
            // thousand, million, billion, trillion.
            var abbrev = ["k", "m", "b", "t"];
            for (var i = abbrev.length - 1; i >= 0; i--) {
                var size = Math.pow(10, (i + 1) * 3);
                if (size <= n) {
                    n = Math.round(n * decPlaces / size) / decPlaces;
                    if ((n === 1000) && (i < abbrev.length - 1)) {
                        n = 1;
                        i++;
                    }
                    n += abbrev[i];
                    break;
                }
            }
            return n;
        },
        _decPlaces: function(n) {
            // number not defined
            if (!n) {
                n = 0;
            }
            // format number according to length
            var decPlaces;
            var nStr = n.toString();
            if (nStr.length >= 7) {
                decPlaces = 1;
            } else if (nStr.length >= 5) {
                decPlaces = 0;
            } else if (nStr.length === 4) {
                return number.format(n);
            } else {
                decPlaces = 2;
            }
            return this._formatNumber(n, decPlaces);
        },
        _displayStats: function() {
            // get features to display
            var features = this.get("features");
            // if we have features
            if (features && features.length) {
                // all config to summarize
                var config = this.get("config");
                var stats = {};
                var i, j, k;
                // each feature
                for (i = 0; i < features.length; i++) {
                    // first feature
                    if (i === 0) {
                        // lets add 1st variable
                        for (j = 0; j < config.length; j++) {
                            // sum parent
                            if (features[i].attributes.hasOwnProperty(config[j].attribute)) {
                                stats[config[j].attribute] = features[i].attributes[config[j].attribute];
                            }
                            if(config[j].children){
                                // sum children
                                for (k = 0; k < config[j].children.length; k++) {
                                    stats[config[j].children[k].attribute] = features[i].attributes[config[j].children[k].attribute];
                                }
                            }
                        }
                    } else {
                        // lets sum each variable
                        for (j = 0; j < config.length; j++) {
                            // append sum parent
                            if (features[i].attributes.hasOwnProperty(config[j].attribute)) {
                                stats[config[j].attribute] += features[i].attributes[config[j].attribute];
                            }
                            if(config[j].children){
                                // append sum children
                                for (k = 0; k < config[j].children.length; k++) {
                                    stats[config[j].children[k].attribute] += features[i].attributes[config[j].children[k].attribute];
                                }
                            }
                        }
                    }
                }
                // set widget stats
                this.set("stats", stats);
                // create panels from stats
                this._createPanels();
                // resize
                this.resize();
                // if panel is expanded already
                if (this._displayedContainer) {
                    this._showExpanded(this._displayedIndex);
                }
                // create panel events
                for (i = 0; i < this._nodes.length; i++) {
                    // if panel has children
                    if(config[i].children && config[i].children.length){
                        this._panelClickEvent(this._nodes[i].panel, i);
                        this._panelCloseEvent(this._nodes[i].detailedPanelHeaderClose);
                    }
                }
                // show geo stats
                this.show();
            } else {
                this.hide();
            }
        },
        _panelCloseEvent: function(node) {
            var expandedClick = on(node, 'click', lang.hitch(this, function() {
                this._hideExpanded();
            }));
            this._events.push(expandedClick);
        },
        _panelClickEvent: function(node, index) {
            // panel click
            var panelClick = on(node, 'click', lang.hitch(this, function() {
                this._showExpanded(index);
            }));
            this._events.push(panelClick);
        },
        _createPanelNode: function(index) {
            var stats = this.get("stats");
            var config = this.get("config");
            var item = config[index];
            var isParent = "";
            if(item.children && item.children.length){
                isParent = this.css.StatsPanelParent;
            }
            // node variables
            var panel, panelContent, panelCount, panelTitle, clearPanel;
            // panel container
            panel = domConstruct.create('div', {
                className: this.css.statsPanel + " " + isParent
            });
            domConstruct.place(panel, this._geoPanelsNode, 'last');
            // panel content holder
            panelContent = domConstruct.create('div', {
                className: this.blockThemes[index]
            });
            domConstruct.place(panelContent, panel, 'last');
            // panel number
            panelCount = domConstruct.create('div', {
                className: this.css.statsCount,
                innerHTML: this._decPlaces(stats[item.attribute])
            });
            domConstruct.place(panelCount, panelContent, 'last');
            // panel title
            panelTitle = domConstruct.create('div', {
                className: this.css.statsTitle,
                innerHTML: item.label
            });
            domConstruct.place(panelTitle, panelContent, 'last');
            // if last item
            if(index === (config.length - 1)){
                // clear blocks
                clearPanel = domConstruct.create('div', {
                    className: this.css.clear
                });
                domConstruct.place(clearPanel, this._geoPanelsNode, 'last');
            }
            // save references to these nodes
            this._nodes[index] = lang.mixin(this._nodes[index], {
                panel: panel,
                panelContent: panelContent,
                panelCount: panelCount,
                panelTitle: panelTitle,
                clearPanel: clearPanel
            });
        },
        _createExpandedPanelNode: function(index) {
            var config = this.get("config");
            var item = config[index];
            var stats = this.get("stats");
            // expanded nodes
            var detailedContainer, detailedLeft, detailedLeftArrow, detailedInnerContainer, detailedCarousel, detailedData, detailedPagination, detailedPaginationContainer, detailedRight, detailedRightArrow, detailedPanel, detailedPanelHeader, detailedPanelHeaderTitle, detailedPanelHeaderSpanTitle, detailedPanelHeaderSpanNumber, detailedPanelHeaderClose, detailedPanelHeaderClear, detailedOuterContainer, detailedDataSource, detailedDataSourceAnchor, clearExpandedPanels, clearDetailedContainer;
            // expanded panel container
            detailedPanel = domConstruct.create('div', {
                className: this.css.statsPanelSelected + " " + this.blockThemes[index]
            });
            domConstruct.place(detailedPanel, this._geoDataPanelsExpandedNode, 'last');
            // header
            detailedPanelHeader = domConstruct.create('div', {
                className: this.css.divHeader
            });
            domConstruct.place(detailedPanelHeader, detailedPanel, 'last');
            // header title
            detailedPanelHeaderTitle = domConstruct.create('div', {
                className: this.css.bgColor + " " + this.css.divHeaderTitle
            });
            domConstruct.place(detailedPanelHeaderTitle, detailedPanelHeader, 'last');
            // header span title
            detailedPanelHeaderSpanTitle = domConstruct.create('span', {
                className: this.css.hTitle,
                innerHTML: item.label
            });
            domConstruct.place(detailedPanelHeaderSpanTitle, detailedPanelHeaderTitle, 'last');
            // header number
            detailedPanelHeaderSpanNumber = domConstruct.create('span', {
                className: this.css.hNumber,
                innerHTML: this._decPlaces(stats[item.attribute])
            });
            domConstruct.place(detailedPanelHeaderSpanNumber, detailedPanelHeaderTitle, 'last');
            // header close
            detailedPanelHeaderClose = domConstruct.create('div', {
                className: this.css.divHeaderClose + " " + this.css.iconCancel,
                title: this._i18n.StatsBlock.close
            });
            domConstruct.place(detailedPanelHeaderClose, detailedPanelHeader, 'last');
            // header clear
            detailedPanelHeaderClear = domConstruct.create('div', {
                className: this.css.clear
            });
            domConstruct.place(detailedPanelHeaderClear, detailedPanelHeader, 'last');
            // slider container
            detailedOuterContainer = domConstruct.create('div', {
                className: this.css.divOuterSliderContainer
            });
            domConstruct.place(detailedOuterContainer, detailedPanel, 'last');
            // if we have children
            if (item.children && item.children.length && item.children.length > 3) {
                // slider container
                detailedContainer = domConstruct.create('div', {
                    className: this.css.divSliderContainer
                });  
                // paginate left
                detailedLeft = domConstruct.create('div', {
                    className: this.css.divLeft
                });
                domConstruct.place(detailedLeft, detailedContainer, 'last');
                // left arrow button
                detailedLeftArrow = domConstruct.create('div', {
                    className: this.css.leftArrow + " " + this.css.disableArrow,
                    title: this._i18n.StatsBlock.previous
                });
                domConstruct.place(detailedLeftArrow, detailedLeft, 'last');
                // another inner container
                detailedInnerContainer = domConstruct.create('div', {
                    className: this.css.divSliderContent
                });
                domConstruct.place(detailedInnerContainer, detailedContainer, 'last');
                // carousel holder
                detailedCarousel = domConstruct.create('div', {
                    className: this.css.carousel + " " + this.css.slidePanel
                });
                domConstruct.place(detailedCarousel, detailedInnerContainer, 'last');
                // container for data
                detailedData = domConstruct.create('div', {
                    className: this.css.divGeoDataHolder
                });
                domConstruct.place(detailedData, detailedCarousel, 'last');
                // pagination container
                detailedPaginationContainer = domConstruct.create('div', {
                    className: this.css.divPaginationContainer
                });
                domConstruct.place(detailedPaginationContainer, detailedInnerContainer, 'last');              
                // pagination
                detailedPagination = domConstruct.create('div', {
                    className: this.css.divPagination
                });
                domConstruct.place(detailedPagination, detailedPaginationContainer, 'last');
                // right paginate
                detailedRight = domConstruct.create('div', {
                    className: this.css.divRight
                });
                domConstruct.place(detailedRight, detailedContainer, 'last');
                // right arrow button
                detailedRightArrow = domConstruct.create('div', {
                    className: this.css.rightArrow + " " + this.css.disableArrow,
                    title: this._i18n.StatsBlock.next
                });
                domConstruct.place(detailedRightArrow, detailedRight, 'last');
            }
            else{
                // container for data
                detailedContainer = domConstruct.create('div', {
                    className: this.css.divGeoDataHolder
                });
                detailedData = detailedContainer;
            }
            domConstruct.place(detailedContainer, detailedOuterContainer, 'last');
            // source link is set
            if(item.dataSourceUrl){
                // source link
                detailedDataSource = domConstruct.create('div', {
                    className: this.css.dataSourceUrl
                });
                domConstruct.place(detailedDataSource, detailedOuterContainer, 'last');
                // data source link a tag
                detailedDataSourceAnchor = domConstruct.create('a', {
                    title: this._i18n.StatsBlock.source,
                    className: this.css.statsSourceInfo,
                    href: item.dataSourceUrl,
                    target: "_blank"
                });
                domConstruct.place(detailedDataSourceAnchor, detailedDataSource, 'last');
            }
            // clear expanded
            clearDetailedContainer = domConstruct.create('div', {
                className: this.css.clear
            });
            domConstruct.place(clearDetailedContainer, detailedContainer, 'last');
            // if last expanded panel
            if(index === (config.length - 1)){
                // clear expanded
                clearExpandedPanels = domConstruct.create('div', {
                    className: this.css.clear
                });
                domConstruct.place(clearExpandedPanels, this._geoDataPanelsExpandedNode, 'last');
            }
            // save references to these nodes
            this._nodes[index] = lang.mixin(this._nodes[index], {
                detailedPanel: detailedPanel,
                detailedPanelHeader: detailedPanelHeader,
                detailedPanelHeaderTitle: detailedPanelHeaderTitle,
                detailedPanelHeaderSpanTitle: detailedPanelHeaderSpanTitle,
                detailedPanelHeaderSpanNumber:detailedPanelHeaderSpanNumber,
                detailedPanelHeaderClose: detailedPanelHeaderClose,
                detailedPanelHeaderClear: detailedPanelHeaderClear,
                detailedOuterContainer: detailedOuterContainer,
                clearDetailedContainer: clearDetailedContainer,
                detailedContainer: detailedContainer,
                detailedInnerContainer: detailedInnerContainer,
                detailedLeft: detailedLeft,
                detailedLeftArrow: detailedLeftArrow,
                detailedCarousel: detailedCarousel,
                detailedData: detailedData,
                detailedPagination: detailedPagination,
                detailedPaginationContainer: detailedPaginationContainer,
                detailedRight: detailedRight,
                detailedRightArrow: detailedRightArrow,
                detailedDataSource: detailedDataSource,
                detailedDataSourceAnchor: detailedDataSourceAnchor,
                clearExpandedPanels: clearExpandedPanels
            });
            // create all children stats
            if (item.children && item.children.length) {
                for (var i = 0; i < item.children.length; i++) {
                    this._createPanelBlockNodes(index, i);
                }
            }
        },
        _createPanelBlockNodes: function(parentIndex, childIndex) {
            var config = this.get("config");
            var item = config[parentIndex];
            var childItem = item.children[childIndex];
            var stats = this.get("stats");
            // node variables
            var detailedChild, detailedChildCount, detailedChildTitle, clearDetailedData;
            // last block class
            var lastBlock = "";
            if((item.children.length - 1) === childIndex){
                lastBlock = " " + this.css.statsPanelDataBlockLast;
            }
            // data block children stats
            detailedChild = domConstruct.create('div', {
                className: this.css.statsPanelDataBlock + lastBlock
            });
            domConstruct.place(detailedChild, this._nodes[parentIndex].detailedData, 'last');
            // child count
            detailedChildCount = domConstruct.create('div', {
                className: this.css.statsCount,
                innerHTML: this._decPlaces(stats[childItem.attribute])
            });
            domConstruct.place(detailedChildCount, detailedChild, 'last');
            // child label
            detailedChildTitle = domConstruct.create('div', {
                className: this.css.statsTitle,
                title: childItem.label,
                innerHTML: childItem.label
            });
            domConstruct.place(detailedChildTitle, detailedChild, 'last');
            // last data item
            if((item.children.length - 1) === childIndex){
                // clear slider
                clearDetailedData = domConstruct.create('div', {
                    className: this.css.clear
                });
                domConstruct.place(clearDetailedData, this._nodes[parentIndex].detailedData, 'last');
            }
            // save references to nodes
            this._nodes[parentIndex].children[childIndex] = {
                detailedChild: detailedChild,
                detailedChildCount: detailedChildCount,
                detailedChildTitle: detailedChildTitle,
                clearDetailedData: clearDetailedData
            };
        },
        _createPanels: function() {
            var config = this.get("config");
            // remove old events
            this._removeEvents();
            // clear previous html
            this._geoPanelsNode.innerHTML = '';
            this._geoDataPanelsExpandedNode.innerHTML = '';
            // node variables
            this._nodes = [];
            // create each block
            for (var i = 0; i < config.length && i < this.blockThemes.length; i++) {
                // panel node references
                this._nodes[i] = {
                    children: [],
                    pagination: []
                };
                // block node
                this._createPanelNode(i);
                // expnaded node
                this._createExpandedPanelNode(i);
                // pagination
                this._createPagination(i);
                this._pageRightEvent(i);
                this._pageLeftEvent(i);
            }
        },
        _pageRightEvent: function(index){
            if(this._nodes[index].detailedRightArrow){
                //change previous/next slide on clicking of left and right arrow.
                var pageRight = on(this._nodes[index].detailedRightArrow, 'click', lang.hitch(this, function() {
                    this._moveSliderPage(index, true);
                }));
                this._events.push(pageRight);
            }
        },
        _pageLeftEvent: function(index){
            if(this._nodes[index].detailedLeftArrow){
                //change previous/next slide on clicking of left and right arrow.
                var pageLeft = on(this._nodes[index].detailedLeftArrow, 'click', lang.hitch(this, function() {
                    this._moveSliderPage(index, false);
                }));
                this._events.push(pageLeft);
            }
        },
        //display next/previous slider page
        _moveSliderPage: function(index, isSlideRight) {
            var nxtPageId = this._selectedPageIndex[index];
            if (isSlideRight) {
                nxtPageId++;
            } else {
                nxtPageId--;
            }
            this._showSelectedPage(index, nxtPageId);
        },
        _createPagination: function(index) {
            // all child stats
            var children = this._nodes[index].children;
            if(children && children.length > this.displayPageCount){
                // count of pages
                var pageCount = Math.ceil(children.length / this.displayPageCount);
                // each page
                for (var i = 0; i < pageCount; i++) {
                    // create dot
                    var spanPaginationDot = domConstruct.create("div", {
                        className: this.css.paginationDot
                    });
                    // if first dot
                    if (i === 0) {
                        // set selected
                        domClass.add(spanPaginationDot, this.css.bgColor);
                        this._selectedPageIndex[index] = 0;
                    }
                    // place dot
                    domConstruct.place(spanPaginationDot, this._nodes[index].detailedPagination, "last");
                    this._nodes[index].pagination[i] = spanPaginationDot;
                    // setup event
                    this._createPageEvent(index, i);
                    // last dot
                    if(i ===(pageCount - 1)){
                        var clearDots = domConstruct.create('div', {
                            className: this.css.clear
                        });
                        domConstruct.place(clearDots,  this._nodes[index].detailedPagination, 'last');
                    }
                }
                // set arrows
                this._setArrowVisibility(index);
            }
        },
        _createPageEvent: function(parentIndex, childIndex) {
            // child pagination node
            var node = this._nodes[parentIndex].pagination[childIndex];
            //Go to slider page on selecting its corresponding pagination dot
            var pageDot = on(node, 'click', lang.hitch(this, function() {
                this._showSelectedPage(parentIndex, childIndex);
            }));
            this._events.push(pageDot);
        },
        //display selected slider page
        _showSelectedPage: function(parentIndex, childIndex) {
            // set selected page index
            this._selectedPageIndex[parentIndex] = childIndex;
            // margin box
            var mb = domGeom.getMarginBox(this._nodes[parentIndex].detailedInnerContainer);
            // width of inner container
            var sliderWidth = mb.w;
            // left offset
            var newLeft = -(sliderWidth + this.displayPageCount) * childIndex;
            // set left offset
            domStyle.set(this._nodes[parentIndex].detailedCarousel, 'left', newLeft + "px");
            // each pagination node
            for (var i = 0; i < this._nodes[parentIndex].pagination.length; i++) {
                // if current selected
                if (i === childIndex) {
                    // set selected class
                    domClass.add(this._nodes[parentIndex].pagination[i], "bgColor");
                } else {
                    // remove selected class
                    domClass.remove(this._nodes[parentIndex].pagination[i], "bgColor");
                }
            }
            // reset arrow visibility
            this._setArrowVisibility(parentIndex);
        },
        _setPanelWidth: function() {
            // if nodes are set
            if(this._nodes && this._nodes.length){
                // get width
                var mb = domGeom.getContentBox(this._geoPanelsNode);
                var w = mb.w;
                domStyle.set(this._geoPanelsNode, 'margin-left', -Math.round(w/2) + 'px');
            }
            // if nodes are set
            /*if(this._nodes && this._nodes.length){
                // get width
                var mb = domGeom.getMarginBox(this._geoPanelsNode);
                var sliderWidth = mb.w;
                // each panel
                for(var i = 0; i < this._nodes.length; i++){
                    // set panel width
                    domStyle.set(this._nodes[i].detailedPanel, 'width', (sliderWidth - 2) + 'px');
                }
            */
        },
        //handle left/right arrow visibility
        _setArrowVisibility: function(index) {
            if (this._selectedPageIndex[index] === 0) {
                domClass.add(this._nodes[index].detailedLeftArrow, this.css.disableArrow);
                domClass.remove(this._nodes[index].detailedRightArrow, this.css.disableArrow);
            } else if (this._selectedPageIndex[index] < this._nodes[index].pagination.length - 1) {
                domClass.remove(this._nodes[index].detailedLeftArrow, this.css.disableArrow);
                domClass.remove(this._nodes[index].detailedRightArrow, this.css.disableArrow);
            } else if (this._selectedPageIndex[index] === this._nodes[index].pagination.length - 1) {
                domClass.add(this._nodes[index].detailedRightArrow, this.css.disableArrow);
                domClass.remove(this._nodes[index].detailedLeftArrow, this.css.disableArrow);
            }
        },
        _resizeSliders: function() {
            if(this._nodes && this._nodes.length){
                // each panel
                for(var i = 0; i < this._nodes.length; i++){  
                    // get data node
                    var dataNode = this._nodes[i].detailedData;
                    if(dataNode){
                        var children = this._nodes[i].children;
                        // if enough children for slider
                        if(children && children.length && children.length > this.displayPageCount){
                            // get width of first child
                            var w = (domStyle.get(children[0].detailedChild, 'width') + 1) * children.length;
                            // set width
                            domStyle.set(dataNode, 'width', w + 'px');
                            // carousel node
                            var carouselNode = this._nodes[i].detailedCarousel;
                            if(carouselNode){
                                // set carousel width
                                domStyle.set(carouselNode, 'width',  w + 'px');
                                // show first page
                                this._showSelectedPage(i, 0);
                            }
                        }
 
                    }
                }
            }
        },
        _removeExpandedClass: function() {
            var config = this.get("config");
            // remove stats panel expanded class from all panels
            array.forEach(this._nodes, lang.hitch(this, function(obj, index) {
                // panel has children
                if(config[index].children && config[index].children.length){
                    domClass.add(obj.panel, this.css.StatsPanelParent);
                }
                domClass.remove(obj.detailedPanel, this.css.animateSlider);
            }));
            // set variables null
            this._displayedContainer = null;
            this._displayedIndex = null;
        },
        _hideExpanded: function() {
            // remove expanded class from widget
            domClass.remove(this.domNode, this.css.statsOpen);
            // remove expanded class from panels
            this._removeExpandedClass();
            // set width of panels
            this._setPanelWidth();
        },
        _showExpanded: function(index) {
            // remove any expanded classes
            this._removeExpandedClass();
            // add expanded class to widget
            domClass.add(this.domNode, this.css.statsOpen);
            // set currenlty displayed container
            this._displayedContainer = this._nodes[index].detailedPanel;
            this._displayedIndex = index;
            // show panel
            domClass.add(this._displayedContainer, this.css.animateSlider);
            // add expanded class
            domClass.remove(this._nodes[index].panel, this.css.StatsPanelParent);
            // set width of panels
            this._setPanelWidth();
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.StatsBlock", Widget, esriNS);
    }
    return Widget;
});
