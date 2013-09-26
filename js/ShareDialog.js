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
    // load template
    "dojo/text!modules/dijit/templates/ShareDialog.html",
    "dojo/i18n!modules/nls/ShareDialog",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojox/html/entities",
    "dijit/Dialog"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, _OnDijitClickMixin, _TemplatedMixin,
    on,
    dijitTemplate, i18n,
    domClass, domStyle, domConstruct,
    entities,
    Dialog
) {
    var Widget = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.ShareDialog",
        templateString: dijitTemplate,
        options: {
            theme: "ShareDialog",
            visible:true,
            url: window.location.href,
            embedWidth: "100%",
            embedHeight: "500",
            dialog: null
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            declare.safeMixin(this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("theme", this.options.theme);
            this.set("url",this.options.url);
            this.set("visible", this.options.visible);
            this.set("dialog", this.options.dialog);
            this.set("embedWidth", this.options.embedWidth);
            this.set("embedHeight", this.options.embedHeight);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("url", this._updateUrlWatch);
            this.watch("shortUrl", this._updateUrlWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "buttonContainer",
                embed: "embedPage",
                button: "toggle-grey",
                buttonSelected: "toggle-grey-on",
                icon: "icon-share"
            };
        },
        // start widget. called by user
        startup: function() {
            this._init();
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // open
        // close
        // toggle
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        show: function(){
            this.set("visible", true);  
        },
        hide: function(){
            this.set("visible", false);
        },
        open: function(){
            domClass.add(this._buttonNode, this._css.buttonSelected);
            this.get("dialog").show();
            this.emit("open", {});
        },
        close: function(){
            this.get("dialog").hide();
            this.emit("close", {});
        },
        toggle: function(){
            var open = this.get("dialog").get("open");
            if(open){
                this.close();
            }
            else{
                this.open();    
            }
            this.emit("toggle", {});
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function() {
            // dialog
            if(!this.get("dialog")){
                var dialog = new Dialog({
                    title: i18n.widgets.ShareDialog.title,
                    style: "width: 300px"
                }, this._dialogNode);
                this.set("dialog", dialog);
            }
            on(this.get("dialog"), 'hide', lang.hitch(this, function(){
                domClass.remove(this._buttonNode, this._css.buttonSelected);
            }));
            this._visible();
            this._updateUrlWatch();
            this.set("loaded", true);
            this.emit("load", {});
        },
        _updateUrlWatch: function(){            
            var es = '<iframe width="' + this.get("embedWidth") + '" height="' + this.get("embedHeight") + '" src="' + this.get("url") + '" frameborder="0" scrolling="no"></iframe>';
            this.set("embed", es);
            this._embedNode.innerHTML = entities.encode(es);
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            if (this.get("loaded")) {
                domClass.remove(this.domNode, oldVal);
                domClass.add(this.domNode, newVal);
            }
        },
        _visible: function(){
            if(this.get("visible")){
                domStyle.set(this.domNode, 'display', 'block');
            }
            else{
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.ShareDialog", Widget, esriNS);
    }
    return Widget;
});