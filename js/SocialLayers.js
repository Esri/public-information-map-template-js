define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "modules/TwitterLayer",
    "modules/FlickrLayer",
    "modules/WebcamsLayer",
    "modules/InstagramLayer",
    "modules/LayerLegend",
    "dojo/on",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/request",
    "dijit/Dialog"
],
    function (
        declare,
        lang,
        event,
        dom,
        domConstruct,
        domStyle,
        TwitterLayer,
        FlickrLayer,
        WebcamsLayer,
        InstagramLayer,
        LayerLegend,
        on,
        QueryTask,
        Query,
        esriRequest,
        Dialog
    ) {
        return declare("", null, {
            initSocial: function () {
                // Twitter
                this._twitterLayer = new TwitterLayer({
                    map: this.map,
                    visible: true,
                    url: this.config.twitterUrl
                });
                this.map.addLayer(this._twitterLayer.featureLayer);
                // Flickr
                this._flickrLayer = new FlickrLayer({
                    map: this.map,
                    visible: true,
                    key: this.config.flickr_key
                });
                this.map.addLayer(this._flickrLayer.featureLayer);
                // Webcams
                this._webcamsLayer = new WebcamsLayer({
                    map: this.map,
                    visible: true,
                    key: this.config.webcams_key
                });
                this.map.addLayer(this._webcamsLayer.featureLayer);
                // Instagram
                this._instagramLayer = new InstagramLayer({
                    map: this.map,
                    visible: true,
                    key: this.config.instagram_key
                });
                this.map.addLayer(this._instagramLayer.featureLayer);
                // social layer infos
                this.socialLayers = [];
                
                this.socialLayers.push({
                    title: this.config.i18n.social.webcams,
                    visibility: this._webcamsLayer.featureLayer.visible,
                    layerObject: this._webcamsLayer.featureLayer
                });
                this.socialLayers.push({
                    title: '<span id="twitter_cog" class="icon-cog"></span>' + this.config.i18n.social.twitter,
                    visibility: this._twitterLayer.featureLayer.visible,
                    content: '<a id="twitter_auth_status"></a><div class="clear"><div>',
                    layerObject: this._twitterLayer.featureLayer
                });
                this.socialLayers.push({
                    title: '<span id="flickr_cog" class="icon-cog"></span>' + this.config.i18n.social.flickr,
                    visibility: this._flickrLayer.featureLayer.visible,
                    layerObject: this._flickrLayer.featureLayer
                });
                this.socialLayers.push({
                    title: this.config.i18n.social.instagram,
                    visibility: this._instagramLayer.featureLayer.visible,
                    layerObject: this._instagramLayer.featureLayer
                });
                // filtering
                if (this.config.bannedUsersService && this.config.flagMailServer) {
                    this._createSMFOffensive();
                }
                if (this.config.bannedWordsService) {
                    this._createSMFBadWords();
                }
                // info window set flag button
                on(this.map.infoWindow, 'set-features', lang.hitch(this, function () {
                    this._featureChange();
                }));
                on(this.map.infoWindow, 'selection-change', lang.hitch(this, function () {
                    this._featureChange();
                }));
                // social layers legend
                var socialLegendNode = dom.byId('SocialLayerLegend');
                if (socialLegendNode) {
                    var LL = new LayerLegend({
                        map: this.map,
                        layers: this.socialLayers
                    }, socialLegendNode);
                    LL.startup();
                }
                // Twitter Dialog
                var twContent = '';
                twContent += '<div class="dialogContent">';
                twContent += '<div class="">Search Terms<div>';
                twContent += '<input class="layerSettingsInput" type="text" value=""><div class="">More information<div>';
                twContent += '<div>Search</div>';
                twContent += '<div class="">Sing in/ switch account<div>';
                twContent += '</div>';
                var twitterDialogNode = domConstruct.create('div', {
                    innerHTML: twContent
                });
                domConstruct.place(twitterDialogNode, document.body, 'last');
                var twitterDialog = new Dialog({
                    title: this.config.i18n.social.twitterSettings,
                    draggable: false
                }, twitterDialogNode);
                var twitterCog = dom.byId('twitter_cog');
                if(twitterCog){
                    on(twitterCog, 'click', lang.hitch(this, function(evt){
                        twitterDialog.show();
                        event.stop(evt);
                    }));
                }
                // Flickr Dialog
                var flContent = '';
                flContent += '<div class="dialogContent">';
                flContent += '<div class="">Search Terms<div>';
                flContent += '<input class="layerSettingsInput" type="text" value=""><div class="">More information<div>';
                flContent += '<div>Search</div>';
                flContent += '<div class="">Sing in/ switch account<div>';
                flContent += '</div>';
                var flickrDialogNode = domConstruct.create('div', {
                    innerHTML: flContent
                });
                domConstruct.place(flickrDialogNode, document.body, 'last');
                var flickrDialog = new Dialog({
                    title: this.config.i18n.social.flickrSettings,
                    draggable: false
                }, flickrDialogNode);
                var flickrCog = dom.byId('flickr_cog');
                if(flickrCog){
                    on(flickrCog, 'click', lang.hitch(this, function(evt){
                        flickrDialog.show();
                        event.stop(evt);
                    }));
                }
                // sign in/switch twitter node
                this._twitterStatusNode = dom.byId('twitter_auth_status');
                // if node found
                if (this._twitterStatusNode) {
                    // sign in click
                    on(this._twitterStatusNode, 'click', lang.hitch(this, function (evt) {
                        // force sign in
                        if (this._twitterLayer.get("authorized")) {
                            // authorized user
                            this._twitterWindow(this.config.twitterSigninUrl, true);
                        } else {
                            // unauthorized user
                            this._twitterWindow(this.config.twitterSigninUrl);
                        }
                        event.stop(evt);
                    }));
                    // authorize check
                    on(this._twitterLayer, 'authorize', lang.hitch(this, function (evt) {
                        if (evt.authorized) {
                            this._twitterStatusNode.innerHTML = '<a>' + this.config.i18n.general.switchAccount + '</a>';
                        } else {
                            this._twitterStatusNode.innerHTML = '<span class="icon-attention-1"></span> <a>' + this.config.i18n.general.signIn + '</a>';
                        }
                    }));
                }
            },
            _featureChange: function () {
                if (this.map && this.map.infoWindow) {
                    // get current graphic
                    var graphic = this.map.infoWindow.getSelectedFeature();
                    // if no flag div exists
                    if (!this._flagDiv) {
                        // create it
                        this._flagDiv = domConstruct.create('a', {
                            style: {
                                display: "none"
                            },
                            innerHTML: this.config.i18n.report.flag
                        });
                        // place in info window actions list
                        domConstruct.place(this._flagDiv, this.map.infoWindow._actionList, 'last');
                        // on flag click
                        on(this._flagDiv, 'click', lang.hitch(this, function () {
                            this._flagUser();
                        }));
                    }
                    if (!this._flagStatusDiv) {
                        // create a hidden status div
                        this._flagStatusDiv = domConstruct.create('span', {
                            style: {
                                display: "none"
                            },
                            innerHTML: ""
                        });
                        domConstruct.place(this._flagStatusDiv, this.map.infoWindow._actionList, 'last');
                    }
                    // clear status
                    this._flagStatusDiv.innerHTML = '';
                    // hide status
                    domStyle.set(this._flagStatusDiv, 'display', 'none');
                    // if its a flaggable item
                    if (graphic && graphic.attributes && graphic.attributes.hasOwnProperty('filterType')) {
                        domStyle.set(this._flagDiv, 'display', 'inline');
                    } else {
                        domStyle.set(this._flagDiv, 'display', 'none');
                    }
                }
            },
            _twitterWindow: function (page, forceLogin) {
                var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
                var redirect_uri = encodeURIComponent(location.protocol + '//' + location.host + package_path + '/oauth-callback.html');
                var w = screen.width / 2;
                var h = screen.height / 1.5;
                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                if (page) {
                    page += '?';
                    if (forceLogin) {
                        page += 'force_login=true';
                    }
                    if (forceLogin && redirect_uri) {
                        page += '&';
                    }
                    if (redirect_uri) {
                        page += 'redirect_uri=' + redirect_uri;
                    }
                    window.open(page, "twoAuth", 'scrollbars=yes, resizable=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left, true);
                    window.oAuthCallback = function () {
                        window.location.reload();
                    };
                }
            },
            _createSMFOffensive: function () {
                if (this.config.bannedUsersService) {
                    // offensive users task
                    this.config.bannedUsersTask = new QueryTask(this.config.bannedUsersService);
                    // offensive users query
                    this.config.bannedUsersQuery = new Query();
                    this.config.bannedUsersQuery.where = '1=1';
                    this.config.bannedUsersQuery.returnCountOnly = false;
                    this.config.bannedUsersQuery.returnIdsOnly = false;
                    this.config.bannedUsersQuery.outFields = ["type", "author"];
                    this.config.bannedUsersTask.execute(this.config.bannedUsersQuery, lang.hitch(this, function (fset) {
                        // Banned twitter users
                        var badTwitterUsers = [];
                        // Banned flickr users
                        var badFlickrUsers = [];
                        // features
                        var features = fset.features;
                        // for each feature
                        for (var i = 0; i < features.length; i++) {
                            // add to twitter list
                            if (parseInt(features[i].attributes.type, 10) === 2) {
                                badTwitterUsers.push(features[i].attributes.author);
                            }
                            // add to flickr list
                            else if (parseInt(features[i].attributes.type, 10) === 4) {
                                badFlickrUsers.push(features[i].attributes.author);
                            }
                        }
                        this._flickrLayer.set("filterUsers", badFlickrUsers);
                        this._twitterLayer.set("filterUsers", badTwitterUsers);
                    }));
                }
            },
            _createSMFBadWords: function () {
                var filterWords = [];
                if (this.config.bannedWordsService) {
                    this.config.bannedWordsTask = new QueryTask(this.config.bannedWordsService);
                    this.config.bannedWordsQuery = new Query();
                    this.config.bannedWordsQuery.where = '1=1';
                    this.config.bannedWordsQuery.returnGeometry = false;
                    this.config.bannedWordsQuery.outFields = ["word"];
                    this.config.bannedWordsTask.execute(this.config.bannedWordsQuery, lang.hitch(this, function (fset) {
                        for (var i = 0; i < fset.features.length; i++) {
                            filterWords.push(fset.features[i].attributes.word);
                        }
                        this._flickrLayer.set("filterWords", filterWords);
                        this._twitterLayer.set("filterWords", filterWords);
                    }));
                }
            },
            _flagUser: function () {
                if (this.config.bannedUsersService && this.config.flagMailServer) {
                    // get current graphic
                    var graphic = this.map.infoWindow.getSelectedFeature();
                    if (graphic) {
                        // hide flag button
                        domStyle.set(this._flagDiv, 'display', 'none');
                        // show status button
                        domStyle.set(this._flagStatusDiv, 'display', 'inline');
                        // status loading
                        this._flagStatusDiv.innerHTML = this.config.i18n.report.loading;
                        // send flag request
                        esriRequest({
                            url: this.config.flagMailServer,
                            content: {
                                "op": "send",
                                "auth": "esriadmin",
                                "author": (graphic.attributes.filterAuthor) ? graphic.attributes.filterAuthor : "",
                                "appname": (this.item.title) ? this.item.title : "",
                                "type": (graphic.attributes.filterType) ? graphic.attributes.filterType : "",
                                "content": (graphic.attributes.filterContent) ? graphic.attributes.filterContent : ""
                            },
                            handleAs: 'json',
                            callbackParamName: 'callback',
                            // on load
                            load: lang.hitch(this, function () {
                                // set status
                                this._flagStatusDiv.innerHTML = this.config.i18n.report.success;
                            }),
                            error: lang.hitch(this, function () {
                                // set status
                                this._flagStatusDiv.innerHTML = this.config.i18n.report.error;
                            })
                        });
                    }
                }
            }
        });
    });