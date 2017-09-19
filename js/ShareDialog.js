define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/string",
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
    "esri/urlUtils",
    "dijit/Dialog",
    "dojo/_base/event"
],
    function (
        Evented,
        declare,
        lang,
        string,
        has, esriNS,
        _WidgetBase, a11yclick, _TemplatedMixin,
        on,
        dijitTemplate, i18n,
        domClass, domStyle, domAttr, domConstruct,
        esriRequest,
        urlUtils,
        Dialog,
        event
    ) {
        var Widget = declare("esri.dijit.ShareDialog", [_WidgetBase, _TemplatedMixin, Evented], {
            templateString: dijitTemplate,
            options: {
                theme: "ShareDialog",
                visible: true,
                dialog: null,
                useExtent: false,
                map: null,
                url: window.location.href,
                image: '',
                title: window.document.title,
                summary: '',
                hashtags: '',
                mailURL: 'mailto:%20?subject=${title}&body=${summary}%20${url}',
                facebookURL: "https://www.facebook.com/sharer/sharer.php?u=${url}",
                twitterURL: "https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=${hashtags}",
                googlePlusURL: "https://plus.google.com/share?url=${url}",
                shortenAPI: "https://arcg.is/prod/shorten",
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
            constructor: function (options, srcRefNode) {
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
                this.set("shortenAPI", defaults.shortenAPI);
                this.set("image", defaults.image);
                this.set("title", defaults.title);
                this.set("summary", defaults.summary);
                this.set("hashtags", defaults.hashtags);
                this.set("useExtent", defaults.useExtent);
                // listeners
                this.watch("theme", this._updateThemeWatch);
                this.watch("url", this._updateUrl);
                this.watch("visible", this._visible);
                this.watch("embedSizes", this._setSizeOptions);
                this.watch("embed", this._updateEmbed);
                this.watch("shortenUrl", this._updateshortenUrl);
                this.watch("useExtent", this._useExtentChanged);
                // classes
                this.css = {
                    container: "button-container",
                    embed: "embed-page",
                    button: "toggle-grey",
                    buttonSelected: "toggle-grey-on",
                    icon: "icon-share",
                    linkIcon: "icon-link share-dialog-icon",
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
                    shareDialogExtent: "share-dialog-extent",
                    mapSizeContainer: "map-size-container",
                    embedMapSizeClear: "embed-map-size-clear",
                    iconClear: "icon-clear"
                };
            },
            // bind listener for button to action
            postCreate: function () {
                this.inherited(arguments);
                this._setExtentChecked();
                this.own(on(this._buttonNode, a11yclick, lang.hitch(this, this.toggle)));
                this.own(on(this._extentInput, a11yclick, lang.hitch(this, this._useExtentUpdate)));
            },
            // start widget. called by user
            startup: function () {
                this._init();
            },
            // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
            destroy: function () {
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
            show: function () {
                this.set("visible", true);
            },
            hide: function () {
                this.set("visible", false);
            },
            open: function () {
                domClass.add(this._buttonNode, this.css.buttonSelected);
                this.get("dialog").show();
                if (this.get("useExtent")) {
                    this._updateUrl();
                }
                this.emit("open", {});
                this._shareLink();
            },
            close: function () {
                this.get("dialog").hide();
                this.emit("close", {});
            },
            toggle: function () {
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
            _stripTags: function (str) {
                var text = domConstruct.create("div", {
                    innerHTML: str
                }).textContent;
                return text || '';
            },
            _setExtentChecked: function () {
                domAttr.set(this._extentInput, 'checked', this.get("useExtent"));
            },
            _useExtentUpdate: function () {
                var value = domAttr.get(this._extentInput, 'checked');
                this.set("useExtent", value);
            },
            _useExtentChanged: function () {
                this._updateUrl();
                this._shareLink();
            },
            _setSizeOptions: function () {
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
            _updateUrl: function () {
                // nothing currently shortened
                this._shortened = null;
                // no shorten shortened
                this.set("shortenUrl", null);
                // vars
                var map = this.get("map"),
                    url = this.get("url"),
                    useSeparator;
                // get url params
                var urlObject = urlUtils.urlToObject(window.location.href);
                urlObject.query = urlObject.query || {};
                // Remove edit=true from the query parameters
                if (urlObject.query.edit) {
                    delete urlObject.query.edit;
                }
                // remove folder id
                if (urlObject.query.folderid) {
                    delete urlObject.query.folderid;
                }
                // remove locale
                if (urlObject.query.locale) {
                    delete urlObject.query.locale;
                }
                // include extent in url
                if (this.get("useExtent") && map) {
                    // get map extent in geographic
                    var gExtent = map.geographicExtent;
                    // set extent string
                    urlObject.query.extent = gExtent.xmin.toFixed(4) + ',' + gExtent.ymin.toFixed(4) + ',' + gExtent.xmax.toFixed(4) + ',' + gExtent.ymax.toFixed(4);

                } else {
                    urlObject.query.extent = null;
                }
                // create base url
                url = location.protocol + '//' + window.location.host + window.location.pathname;
                // each param
                for (var i in urlObject.query) {
                    if (urlObject.query[i]) {
                        // use separator 
                        if (useSeparator) {
                            url += '&';
                        } else {
                            url += '?';
                            useSeparator = true;
                        }
                        url += i + '=' + urlObject.query[i];
                    }
                }
                // update url
                this.set("url", url);
                // reset embed code
                this._setEmbedCode();
                // set url value
                domAttr.set(this._shareMapUrlText, "value", url);
                domAttr.set(this._linkButton, "href", url);
            },
            _init: function () {
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
                this.own(on(this.get("dialog"), 'hide', lang.hitch(this, function () {
                    domClass.remove(this._buttonNode, this.css.buttonSelected);
                })));
                // set visible
                this._visible();
                // set embed url
                this._updateUrl();
                // select menu change
                this.own(on(this._comboBoxNode, "change", lang.hitch(this, function (evt) {
                    this.set("embedWidth", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].width);
                    this.set("embedHeight", this.get("embedSizes")[parseInt(evt.currentTarget.value, 10)].height);
                    this._setEmbedCode();
                })));
                // facebook click
                this.own(on(this._facebookButton, a11yclick, lang.hitch(this, function () {
                    this._configureShareLink(this.get("facebookURL"));
                })));
                // twitter click
                this.own(on(this._twitterButton, a11yclick, lang.hitch(this, function () {
                    this._configureShareLink(this.get("twitterURL"));
                })));
                // google plus click
                this.own(on(this._gpulsButton, a11yclick, lang.hitch(this, function () {
                    this._configureShareLink(this.get("googlePlusURL"));
                })));
                // email click
                this.own(on(this._emailButton, a11yclick, lang.hitch(this, function () {
                    this._configureShareLink(this.get("mailURL"), true);
                })));
                // link box click
                this.own(on(this._shareMapUrlText, a11yclick, lang.hitch(this, function () {
                    this._shareMapUrlText.setSelectionRange(0, 9999);
                })));
                // link box mouseup stop for touch devices
                this.own(on(this._shareMapUrlText, 'mouseup', function (evt) {
                    event.stop(evt);
                }));
                // embed box click
                this.own(on(this._embedNode, a11yclick, lang.hitch(this, function () {
                    this._embedNode.setSelectionRange(0, 9999);
                })));
                // embed box mouseup stop for touch devices
                this.own(on(this._embedNode, 'mouseup', function (evt) {
                    event.stop(evt);
                }));
                // rotate
                this.own(on(window, "orientationchange", lang.hitch(this, function () {
                    var open = this.get("dialog").get("open");
                    if (open) {
                        dialog.hide();
                        dialog.show();
                    }
                })));
                // loaded
                this.set("loaded", true);
                this.emit("load", {});
            },
            _updateEmbed: function () {
                domAttr.set(this._embedNode, "value", this.get("embed"));
            },
            _setEmbedCode: function () {
                var es = '<iframe width="' + this.get("embedWidth") + '" height="' + this.get("embedHeight") + '" src="' + this.get("url") + '" frameborder="0" scrolling="no"></iframe>';
                this.set("embed", es);
            },
            _updateshortenUrl: function () {
                var shorten = this.get("shortenUrl");
                if (shorten) {
                    domAttr.set(this._shareMapUrlText, "value", shorten);
                    domAttr.set(this._linkButton, "href", shorten);
                }
            },
            _shareLink: function () {
                var currentUrl = this.get("url");

                this._shortened = currentUrl;
                // make request
                return esriRequest({
                    url: this.get("shortenAPI"),
                    callbackParamName: "callback",
                    content: {
                        longUrl: currentUrl,
                        f: "json"
                    },
                    load: lang.hitch(this, function (response) {
                        if (response && response.data && response.data.url) {
                            this.set("shortenUrl", response.data.url);
                            this._shareMapUrlText.select();
                        }
                    }),
                    error: function (error) {
                        console.log(error);
                    }
                });
            },
            _configureShareLink: function (Link, isMail) {
                // replace strings
                var fullLink = string.substitute(Link, {
                    url: encodeURIComponent(this.get("shortenUrl") ? this.get("shortenUrl") : this.get("url")),
                    image: encodeURIComponent(this.get("image")),
                    title: encodeURIComponent(this.get("title")),
                    summary: encodeURIComponent(this._stripTags(this.get("summary"))),
                    hashtags: encodeURIComponent(this.get("hashtags"))
                });
                // email link
                if (isMail) {
                    window.location.href = fullLink;
                } else {
                    window.open(fullLink, 'share', true);
                }
            },
            _updateThemeWatch: function () {
                var oldVal = arguments[1];
                var newVal = arguments[2];
                if (this.get("loaded")) {
                    domClass.remove(this.domNode, oldVal);
                    domClass.add(this.domNode, newVal);
                }
            },
            _visible: function () {
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