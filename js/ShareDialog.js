define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/a11yclick",
    "dijit/_TemplatedMixin",
    "dojo/on",
     // load template
    "dojo/text!application/dijit/templates/ShareDialog.html",
    "dojo/i18n!application/nls/ShareDialog",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "esri/request",
    "dijit/Dialog"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, a11yclick, _TemplatedMixin,
    on,
    dijitTemplate, i18n,
    domClass, domStyle, domAttr, domConstruct,
    esriRequest,
    Dialog
) {
    var Widget = declare([_WidgetBase, _TemplatedMixin, Evented], {
        declaredClass: "esri.dijit.ShareDialog",
        templateString: dijitTemplate,
        options: {
            theme: "ShareDialog",
            visible: true,
            dialog: null,
            url: window.location.href,
            image: '',
            title: window.document.title,
            summary: '',
            hashtags: '',
            mailURL: 'mailto:%20?subject={title}&body={summary}%20{url}',
            facebookURL: "https://www.facebook.com/sharer/sharer.php?s=100&p[url]={url}&p[images][0]={image}&p[title]={title}&p[summary]={summary}",
            twitterURL: "https://twitter.com/intent/tweet?url={url}&text={title}&hashtags={hashtags}",
            googlePlusURL: "https://plus.google.com/share?url={url}",
            bitlyAPI: "http://api.bit.ly/v3/shorten",
            bitlyLogin: "",
            bitlyKey: "",
            embedSizes: [{
                "width": "100%",
                "height": "640px"
            }, {
                "width": "100%",
                "height": "480px"
            }, {
                "width": "100%",
                "height": "320px"
            }, {
                "width": "800px",
                "height": "600px"
            }, {
                "width": "640px",
                "height": "480px"
            }, {
                "width": "480px",
                "height": "320px"
            }]
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            this._i18n = i18n;
            // properties
            this.set("theme", defaults.theme);
            this.set("url", defaults.url);
            this.set("visible", defaults.visible);
            this.set("dialog", defaults.dialog);
            this.set("embedSizes", defaults.embedSizes);
            this.set("embedHeight", defaults.embedHeight);
            this.set("embedWidth", defaults.embedWidth);
            this.set("mailURL", defaults.mailURL);
            this.set("facebookURL", defaults.facebookURL);
            this.set("twitterURL", defaults.twitterURL);
            this.set("googlePlusURL", defaults.googlePlusURL);
            this.set("bitlyAPI", defaults.bitlyAPI);
            this.set("bitlyLogin", defaults.bitlyLogin);
            this.set("bitlyKey", defaults.bitlyKey);                
            this.set("image", defaults.image);
            this.set("title", defaults.title);
            this.set("summary", defaults.summary);
            this.set("hashtags", defaults.hashtags);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("url", this._updateUrl);
            this.watch("visible", this._visible);
            this.watch("embedSizes", this._setSizeOptions);
            this.watch("embed", this._updateEmbed);
            this.watch("bitlyUrl", this._updateBitlyUrl);
            // classes
            this.css = {
                container: "button-container",
                embed: "embed-page",
                button: "toggle-grey",
                buttonSelected: "toggle-grey-on",
                icon: "icon-share",
                facebookIcon: "icon-facebook-squared-1 share-dialog-icon",
                twitterIcon: "icon-twitter-1 share-dialog-icon",
                gplusIcon: "icon-gplus share-dialog-icon",
                emailIcon: "icon-mail share-dialog-icon",
                mapSizeLabel: "map-size-label",
                shareMapURL: "share-map-url",
                iconContainer: "icon-container",
                embedMapSizeDropDown: "embed-map-size-dropdown",
                shareDialogContent: "dialog-content",
                shareDialogSubHeader: "share-dialog-subheader",
                shareDialogTextarea: "share-dialog-textarea",
                mapSizeContainer: "map-size-container",
                embedMapSizeClear: "embed-map-size-clear",
                iconClear: "icon-clear"
            };
        },
        // bind listener for button to action
        postCreate: function() {
            this.inherited(arguments);
            this.own(on(this._buttonNode, a11yclick, lang.hitch(this, this.toggle)));
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
        show: function() {
            this.set("visible", true);
        },
        hide: function() {
            this.set("visible", false);
        },
        open: function() {
            domClass.add(this._buttonNode, this.css.buttonSelected);
            this.get("dialog").show();
            this.emit("open", {});
            this._shareLink();
        },
        close: function() {
            this.get("dialog").hide();
            this.emit("close", {});
        },
        toggle: function() {
            var open = this.get("dialog").get("open");
            if (open) {
                this.close();
            } else {
                this.open();
            }
            this.emit("toggle", {});
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
        _setSizeOptions: function() {
            // clear select menu
            this._comboBoxNode.innerHTML = '';
            // if embed sizes exist
            if (this.get("embedSizes") && this.get("embedSizes").length) {
                // map sizes
                for (var i = 0; i < this.get("embedSizes").length; i++) {
                    if (i === 0) {
                        this.set("embedWidth", this.get("embedSizes")[i].width);
                        this.set("embedHeight", this.get("embedSizes")[i].height);
                    }
                    var option = domConstruct.create("option", {
                        value: i,
                        innerHTML: this.get("embedSizes")[i].width + " x " + this.get("embedSizes")[i].height
                    });
                    domConstruct.place(option, this._comboBoxNode, "last");
                }
            }
        },
        _updateUrl: function() {
            // nothing currently shortened
            this._shortened = null;
            // no bitly shortened
            this.set("bitlyUrl", null);
            // reset embed code
            this._setEmbedCode();
            // set url value
            domAttr.set(this._shareMapUrlText, "value", this.get("url"));
        },
        _init: function() {
            // setup events
            this._removeEvents();
            // set sizes for select box
            this._setSizeOptions();
            // dialog
            if (!this.get("dialog")) {
                var dialog = new Dialog({
                    title: i18n.widgets.ShareDialog.title,
                    draggable: false
                }, this._dialogNode);
                this.set("dialog", dialog);
            }
            // dialog hide
            var dialogHide = on(this.get("dialog"), 'hide', lang.hitch(this, function() {
                domClass.remove(this._buttonNode, this.css.buttonSelected);
            }));
            this._events.push(dialogHide);
            // set visible
            this._visible();
            // set embed url
            this._updateUrl();
            // select menu change
            var selectChange = on(this._comboBoxNode, "change", lang.hitch(this, function(evt) {
                this.set("embedWidth", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].width);
                this.set("embedHeight", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].height);
                this._setEmbedCode();
            }));
            this._events.push(selectChange);
            // facebook click
            var facebook = on(this._facebookButton, "click", lang.hitch(this, function() {
                this._configureShareLink(this.get("facebookURL"));
            }));
            this._events.push(facebook);
            // twitter click
            var twitter = on(this._twitterButton, "click", lang.hitch(this, function() {
                this._configureShareLink(this.get("twitterURL"));
            }));
            this._events.push(twitter);
            // google plus click
            var gplus = on(this._gpulsButton, "click", lang.hitch(this, function() {
                this._configureShareLink(this.get("googlePlusURL"));
            }));
            this._events.push(gplus);
            // email click
            var email = on(this._emailButton, "click", lang.hitch(this, function() {
                this._configureShareLink(this.get("mailURL"), true);
            }));
            this._events.push(email);
            // link box click
            var linkclick = on(this._shareMapUrlText, "click", lang.hitch(this, function() {
                this._shareMapUrlText.select();
            }));
            this._events.push(linkclick);
            // embed box click
            var embedclick = on(this._embedNode, "click", lang.hitch(this, function() {
                this._embedNode.select();
            }));
            this._events.push(embedclick);
            // rotate
            var rotate = on(window, "orientationchange", lang.hitch(this, function() {
                var open = this.get("dialog").get("open");
                if (open) {
                    dialog.hide();
                    dialog.show();
                }
            }));
            this._events.push(rotate);
            // loaded
            this.set("loaded", true);
            this.emit("load", {});
        },
        _updateEmbed: function(){
            domAttr.set(this._embedNode, "value", this.get("embed"));
        },
        _setEmbedCode: function() {
            var es = '<iframe width="' + this.get("embedWidth") + '" height="' + this.get("embedHeight") + '" src="' + this.get("url") + '" frameborder="0" scrolling="no"></iframe>';
            this.set("embed", es);
        },
        _updateBitlyUrl: function(){
            var bitly = this.get("bitlyUrl");
            if(bitly){
                domAttr.set(this._shareMapUrlText, "value", bitly);
            }
        },
        _shareLink: function() {
            if (this.get("bitlyAPI") && this.get("bitlyLogin") && this.get("bitlyKey")) {
                var currentUrl = this.get("url");
                // not already shortened
                if(currentUrl !== this._shortened){
                    // set shortened
                    this._shortened = currentUrl;
                    // make request
                    esriRequest({
                        url: this.get("bitlyAPI"),
                        callbackParamName: "callback",
                        content: {
                            uri: currentUrl,
                            login: this.get("bitlyLogin"),
                            apiKey: this.get("bitlyKey"),
                            f: "json"
                        },
                        load: lang.hitch(this, function(response) {
                            if (response && response.data && response.data.url) {
                                this.set("bitlyUrl", response.data.url);
                            }                            
                        }),
                        error: function(error) {
                            console.log(error);
                        }
                    });
                }
            }
        },
        _configureShareLink: function(Link, isMail) {
            // replace strings
            var fullLink = lang.replace(Link,{
                url: encodeURIComponent(this.get("bitlyUrl") ? this.get("bitlyUrl") : this.get("url")),
                image: encodeURIComponent(this.get("image")),
                title: encodeURIComponent(this.get("title")),
                summary: encodeURIComponent(this.get("summary")),
                hashtags: encodeURIComponent(this.get("hashtags")),
            });
            // email link
            if (isMail) {
                window.location.href = fullLink;
            } else {
                window.open(fullLink, 'share', true);
            }
        },
        _updateThemeWatch: function(attr, oldVal, newVal) {
            if (this.get("loaded")) {
                domClass.remove(this.domNode, oldVal);
                domClass.add(this.domNode, newVal);
            }
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
        lang.setObject("dijit.ShareDialog", Widget, esriNS);
    }
    return Widget;
});
