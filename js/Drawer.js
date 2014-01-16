define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/Deferred",
    "dojo/window"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase,
    on,
    domClass, domStyle,
    BorderContainer, ContentPane,
    Deferred,
    win
) {
    var Widget = declare([_WidgetBase, Evented], {
        declaredClass: "esri.dijit.Drawer",
        options: {
            showDrawerSize: 850,
            container: null,
            contentCenter: null,
            contentLeft: null,
            toggleButton: null,
            direction: 'ltr'
        },
        // lifecycle: 1
        constructor: function(options) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // properties
            this.set("showDrawerSize", defaults.showDrawerSize);
            this.set("container", defaults.container);
            this.set("contentCenter", defaults.contentCenter);
            this.set("contentLeft", defaults.contentLeft);
            this.set("toggleButton", defaults.toggleButton);
            this.set("direction", defaults.direction);
            // classes
            this.css = {
                toggleBlue: 'toggle-grey',
                toggleBlueOn: 'toggle-grey-on',
                drawerOpen: "drawer-open",
                drawerOpenShadow: "drawer-open-shadow"
            };
            // browser supports pointer events
            this._pointerEventSupport = this._pointerEventsSupport();
        },
        // start widget. called by user
        startup: function() {
            this._init();
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this._removeEvents();
            this.inherited(arguments);
        },
        resize: function(){
            if(this._bc_outer){
                this._bc_outer.layout();
            }
            // drawer status resize
            this.emit('resize',{});
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // resize
        // toggle
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        toggle: function(add) {
            // deferred to return
            var def = new Deferred();
            // true if drawer is opened
            var currentlyOpen = domClass.contains(document.body, this.css.drawerOpen);
            // if already open or already closed and asked to do the same
            if(currentlyOpen && add === true || !currentlyOpen && add === false){
                // return
                return def.promise;
            }
            // whether drawer is now opened or closed
            var nowOpen;                           
            // if add is set
            if(typeof add !== 'undefined'){
                nowOpen = domClass.toggle(document.body, this.css.drawerOpen, add);    
            }
            else{
                nowOpen = domClass.toggle(document.body, this.css.drawerOpen, !currentlyOpen);    
            }
            // supports pointer events
            if(this._pointerEventSupport){
                // remove shadow
                domClass.remove(document.body, this.css.drawerOpenShadow);
            }
            // if steps animation exists
            if(this._animationSteps){
                clearInterval(this._animationSteps);
                this._animationSteps = null;
            }
            // resize during animation
            this._animationSteps = setInterval(lang.hitch(this, function(){
                // resize border container
                this.resize();
            }), 25);
            // remove timeout if exists
            if(this._animationTimeout){
                clearTimeout(this._animationTimeout);
                this._animationTimeout = null;
            }
            // wait for animation to finish
            this._animationTimeout = setTimeout(lang.hitch(this, function(){
                // resize border container
                this.resize();
                // remove shown drawer
                this._checkDrawerStatus();
                // stop resizing container
                clearInterval(this._animationSteps);
                this._animationSteps = null;
                // now drawer is open
                if(nowOpen && this._pointerEventSupport){
                    // add shadow
                    domClass.add(document.body, this.css.drawerOpenShadow);
                }
                // return
                def.resolve();
            }), 260);
            // return when done
            return def.promise;
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _pointerEventsSupport: function(){
            var element = document.createElement('x');
            element.style.cssText = 'pointer-events:auto';
            return element.style.pointerEvents === 'auto';   
        },
        _removeEvents: function() {
            if (this._events && this._events.length) {
                for (var i = 0; i < this._events.length; i++) {
                    this._events[i].remove();
                }
            }
            this._events = [];
            // destroy content panes
            if(this.cp_outer_center){
                this.cp_outer_center.destroy();
            }
            if(this.cp_outer_left){
                this.cp_outer_left.destroy();
            }
            // destroy content pane
            if(this._bc_outer){
                this._bc_outer.destroy();
            }
        },
        _init: function() {
            // setup events
            this._removeEvents();
            // outer container
            this._bc_outer = new BorderContainer({
                gutters: false
            }, this.get("container"));
            // center panel
            this.cp_outer_center = new ContentPane({
                region: "center"
            }, this.get("contentCenter"));
            this._bc_outer.addChild(this.cp_outer_center);
            // panel side
            var side = 'left';
            if(this.get("direction") === 'rtl'){
                side = 'right';
            }
            // left panel
            this.cp_outer_left = new ContentPane({
                region: side
            }, this.get("contentLeft"));
            this._bc_outer.addChild(this.cp_outer_left);
            // start border container
            this._bc_outer.startup();
            // drawer button
            var toggleClick = on(this.get("toggleButton"), 'click', lang.hitch(this, function() {
                this.toggle();
            }));
            this._events.push(toggleClick);
            // drawer node
            this._drawer = this.cp_outer_left.domNode;
            // drawer width
            this._drawerWidth = domStyle.get(this._drawer, 'width');
            // window size event
            var winResize = on(window, 'resize', lang.hitch(this, function(){
                this._windowResized();
            }));
            this._events.push(winResize);
            // check window size
            this._windowResized();
            // fix layout
            this.resize();
            this.set("loaded", true);
            this.emit("load", {});  
        },
        _windowResized: function(){
            // view screen
            var vs = win.getBox();
            // if window width is less than specified size
            if (vs.w < this.get("showDrawerSize")) {
                // hide drawer
                this.toggle(false);
            }
            else{
                // show drawer
                this.toggle(true);
            }
            // remove forced open
            this._checkDrawerStatus();
        },
        _checkDrawerStatus: function(){
            // border container layout
            this.resize();
            // hamburger button toggle
            this._toggleButton();
        },
        _toggleButton: function() {
            // if drawer is displayed
            if (domClass.contains(document.body, this.css.drawerOpen)) {
                // has normal class
                if (domClass.contains(this.get("toggleButton"), this.css.toggleBlue)) {
                    // replace with selected class
                    domClass.replace(this.get("toggleButton"), this.css.toggleBlueOn, this.css.toggleBlue);
                }
            } else {
                // has selected class
                if (domClass.contains(this.get("toggleButton"), this.css.toggleBlueOn)) {
                    // replace with normal class
                    domClass.replace(this.get("toggleButton"), this.css.toggleBlue, this.css.toggleBlueOn);
                }
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.Drawer", Widget, esriNS);
    }
    return Widget;
});
