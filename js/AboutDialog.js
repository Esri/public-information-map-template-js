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
    "dojo/text!modules/dijit/templates/AboutDialog.html",
    "dojo/i18n!modules/nls/AboutDialog",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
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
    Dialog
) {
    var Widget = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.AboutDialog",
        templateString: dijitTemplate,
        options: {
            theme: "AboutDialog",
            visible:true,
            info: null,
            sharinghost: "http://www.arcgis.com",
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
            this.set("visible", this.options.visible);
            this.set("dialog", this.options.dialog);
            this.set("item", this.options.item);
            this.set("sharinghost", this.options.sharinghost);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            // classes
            this._css = {
                container: "buttonContainer",
                button: "toggle-grey",
                buttonSelected: "toggle-grey-on",
                icon: "icon-info-circled-1"
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
                    title: i18n.widgets.AboutDialog.title,
                    style: "width: 300px"
                }, this._dialogNode);
                this.set("dialog", dialog);
            }
            on(this.get("dialog"), 'hide', lang.hitch(this, function(){
                domClass.remove(this._buttonNode, this._css.buttonSelected);
            }));
            this._setDialogContent();
            this._visible();
            this.set("loaded", true);
            this.emit("load", {});
        },
        _setDialogContent: function(){
            var item = this.get("item");
            if(item){
                this._titleNode.innerHTML = item.title;
                this._descriptionNode.innerHTML = item.description;
                var tags = item.tags;
                this._tagsNode.innerHTML = '';
                if(tags && tags.length){
                    for(var i = 0; i < tags.length; i++){
                        if(i !== 0){
                            this._tagsNode.innerHTML += ', ';
                        }
                        this._tagsNode.innerHTML += tags[i];
                    }
                }
                this._licenseInfoNode.innerHTML = item.licenseInfo;
                this._infoNode.innerHTML = '(' + item.numViews + ' ' + i18n.widgets.AboutDialog.views + ', ' + item.numComments + ' ' + i18n.widgets.AboutDialog.comments + ')';
                this._moreInfoNode.innerHTML = '<a target="_blank" href="' + this.get("sharinghost") + '/home/item.html?id=' + item.id + '">' + i18n.widgets.AboutDialog.itemInfo+ '</a>';
            }
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
        lang.setObject("dijit.AboutDialog", Widget, esriNS);
    }
    return Widget;
});