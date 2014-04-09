define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-attr",
    "application/TwitterLayer",
    "application/FlickrLayer",
    "application/WebcamsLayer",
    "application/InstagramLayer",
    "dojo/on",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/request",
    "dijit/Dialog",
    "dojo/keys"
],
    function (
        declare,
        lang,
        event,
        dom,
        domConstruct,
        domStyle,
        domAttr,
        TwitterLayer,
        FlickrLayer,
        WebcamsLayer,
        InstagramLayer,
        on,
        QueryTask,
        Query,
        esriRequest,
        Dialog,
        keys
    ) {
        return declare("", null, {
            initSocial: function () {
                // css classes for social layers
                this.socialCSS = {
                    iconAttention: "icon-attention-1",
                    dialogContent: "dialog-content",
                    layerSettingsHeader: "layer-settings-header",
                    layerSettingsMoreInfo: "layer-settings-more-info",
                    layerSettingsInput: "layer-settings-input",
                    layerSettingsDescription: "layer-settings-description",
                    layerSettingsSubmit: "layer-settings-submit",
                    authStatus: "twitter-auth-status",
                    clear: "clear"
                };
                // social layer infos
                this.socialLayers = [];
                this.socialLayerInfos = [];
                // webcams enabled
                if(this.config.enableWebcams){
                    // Webcams
                    this._webcamsLayer = new WebcamsLayer({
                        map: this.map,
                        visible: this.config.webcamsVisible,
                        key: this.config.webcams_key
                    });
                    // legend info
                    this.socialLayers.push({
                        title: this.config.i18n.social.webcams,
                        visibility: this._webcamsLayer.featureLayer.visible,
                        layerObject: this._webcamsLayer.featureLayer
                    });
                    this.socialLayerInfos.push({
                        title: this.config.i18n.social.webcams,
                        layer: this._webcamsLayer.featureLayer
                    });
                }
                // twitter enabled
                if(this.config.enableTwitter){
                    // Twitter
                    this._twitterLayer = new TwitterLayer({
                        map: this.map,
                        visible: this.config.twitterVisible,
                        searchTerm: this.config.twitterSearch,
                        url: this.config.twitterUrl
                    });
                    // legend info
                    this.socialLayers.push({
                        title: this.config.i18n.social.twitter,
                        settings: 'twitter_cog',
                        account: 'twitter_auth_status',
                        visibility: this._twitterLayer.featureLayer.visible,
                        layerObject: this._twitterLayer.featureLayer
                    });
                    // legend info
                    this.socialLayerInfos.push({
                        title: this.config.i18n.social.twitter,
                        layer: this._twitterLayer.featureLayer
                    });
                }
                // flickr enabled
                if(this.config.enableFlickr){
                    // Flickr
                    this._flickrLayer = new FlickrLayer({
                        map: this.map,
                        visible: this.config.flickrVisible,
                        searchTerm: this.config.flickrSearch,
                        key: this.config.flickr_key
                    });
                    // legend info
                    this.socialLayers.push({
                        title: this.config.i18n.social.flickr,
                        settings: 'flickr_cog',
                        visibility: this._flickrLayer.featureLayer.visible,
                        layerObject: this._flickrLayer.featureLayer
                    });
                    // legend info
                    this.socialLayerInfos.push({
                        title: this.config.i18n.social.flickr,
                        layer: this._flickrLayer.featureLayer
                    });
                }
                // instagram enabled
                if(this.config.enableInstagram){
                    // Instagram
                    this._instagramLayer = new InstagramLayer({
                        map: this.map,
                        visible: this.config.instagramVisible,
                        key: this.config.instagram_key
                    });
                    // legend info
                    this.socialLayers.push({
                        title: this.config.i18n.social.instagram,
                        visibility: this._instagramLayer.featureLayer.visible,
                        layerObject: this._instagramLayer.featureLayer
                    });
                    // legend info
                    this.socialLayerInfos.push({
                        title: this.config.i18n.social.instagram,
                        layer: this._instagramLayer.featureLayer
                    });
                }
                // filtering
                if (this.config.bannedUsersService && this.config.flagMailServer) {
                    this._createSMFOffensive();
                }
                // bad words filter
                if (this.config.bannedWordsService) {
                    this._createSMFBadWords();
                }
                // if flag servers set
                if (this.config.bannedUsersService && this.config.flagMailServer) {
                    // info window set flag button
                    on(this.map.infoWindow, 'set-features', lang.hitch(this, function () {
                        this._featureChange();
                    }));
                    on(this.map.infoWindow, 'selection-change', lang.hitch(this, function () {
                        this._featureChange();
                    }));
                }
                // add social layers to legend
                this.layerInfos = this.layerInfos.concat(this.socialLayerInfos);
            },
            configureSocial: function(){
              // flickr enabled
                if(this.config.enableFlickr){
                    // Flickr Dialog
                    var flContent = '';
                    flContent += '<div class="' + this.socialCSS.dialogContent + '">';
                    flContent += '<div class="' + this.socialCSS.layerSettingsDescription + '">' + this.config.i18n.social.flSettingsInfo + '</div>';
                    flContent += '<div class="' + this.socialCSS.layerSettingsHeader + '">' + this.config.i18n.social.searchTerms + '</div>';
                    flContent += '<input id="flickr_search_input" class="' + this.socialCSS.layerSettingsInput + '" type="text" value="' + this.config.flickrSearch + '">';
                    flContent += '<div id="flickr_search_submit" class="' + this.socialCSS.layerSettingsSubmit + '">' + this.config.i18n.social.search + '</div>';
                    flContent += '</div>';
                    var flickrDialogNode = domConstruct.create('div', {
                        innerHTML: flContent
                    });
                    // dialog node
                    domConstruct.place(flickrDialogNode, document.body, 'last');
                    // dialog
                    this._flickrDialog = new Dialog({
                        title: this.config.i18n.social.flickrSettings,
                        draggable: false
                    }, flickrDialogNode);
                    // settings icon
                    var flickrCog = dom.byId('flickr_cog');
                    if(flickrCog){
                        domAttr.set(flickrCog, 'title', this.config.i18n.general.settings);
                        on(flickrCog, 'click', lang.hitch(this, function(evt){
                            this._flickrDialog.show();
                            event.stop(evt);
                        }));
                    }
                    // flickr settings search nodes
                    var flSearchNode = dom.byId('flickr_search_submit');
                    var flInputNode = dom.byId('flickr_search_input');
                    if(flSearchNode && flInputNode){
                        // flickr search button click
                        on(flSearchNode, 'click', lang.hitch(this, function(){
                            this._updateFlickrSearch(flInputNode);
                        }));
                        // flickr search input keypress enter
                        on(flInputNode, 'keypress', lang.hitch(this, function(evt){
                            var charOrCode = evt.charCode || evt.keyCode;
                            switch (charOrCode) {
                            case keys.ENTER:
                                this._updateFlickrSearch(flInputNode);
                                break;
                            }
                        }));
                    }
                    // flickr filtered by text
                    this._flickrLayer.watch("searchTerm", lang.hitch(this, function(){
                        this._updateFlickrFilter();
                    }));
                    this._updateFlickrFilter();
                }
                // twitter enabled dialog
                if(this.config.enableTwitter){
                    // Twitter Dialog
                    var twContent = '';
                    twContent += '<div class="' + this.socialCSS.dialogContent + '">';
                    twContent += '<div class="' + this.socialCSS.layerSettingsDescription + '">' + this.config.i18n.social.twSettingsInfo + '</div>';
                    twContent += '<div class="' + this.socialCSS.layerSettingsHeader + '">' + this.config.i18n.social.searchTerms + '</div>';
                    twContent += '<input id="twitter_search_input" class="' + this.socialCSS.layerSettingsInput + '" type="text" value="' + this.config.twitterSearch + '">';
                    twContent += '<div id="twitter_search_submit" class="' + this.socialCSS.layerSettingsSubmit + '">' + this.config.i18n.social.search + '</div>';
                    twContent += '<div class="' + this.socialCSS.layerSettingsDescription + '">' + this.config.i18n.social.advancedOperators + '</div>';
                    twContent += '<div class="' + this.socialCSS.layerSettingsHeader + '">' + this.config.i18n.social.twitterUser + '</div>';
                    twContent += '<div id="twitter_settings_auth">' + this.config.i18n.social.twitterAccountStatus + '</div>';
                    twContent += '</div>';
                    var twitterDialogNode = domConstruct.create('div', {
                        innerHTML: twContent
                    });
                    // dialog node
                    domConstruct.place(twitterDialogNode, document.body, 'last');
                    // dialog
                    this._twitterDialog = new Dialog({
                        title: this.config.i18n.social.twitterSettings,
                        draggable: false
                    }, twitterDialogNode);
                    // settings icon
                    var twitterCog = dom.byId('twitter_cog');
                    if(twitterCog){
                        domAttr.set(twitterCog, 'title', this.config.i18n.general.settings);
                        on(twitterCog, 'click', lang.hitch(this, function(evt){
                            this._twitterDialog.show();
                            event.stop(evt);
                        }));
                    }
                    // twitter search settings
                    var twSearchNode = dom.byId('twitter_search_submit');
                    var twInputNode = dom.byId('twitter_search_input');
                    if(twSearchNode && twInputNode){
                        // twitter search button click
                        on(twSearchNode, 'click', lang.hitch(this, function(){
                            this._updateTwitterSearch(twInputNode);
                        }));
                        // twitter search input keypress enter
                        on(twInputNode, 'keypress', lang.hitch(this, function(evt){
                            var charOrCode = evt.charCode || evt.keyCode;
                            switch (charOrCode) {
                            case keys.ENTER:
                                this._updateTwitterSearch(twInputNode);
                                break;
                            }
                        }));
                    }
                    // sign in/switch twitter node
                    this._twitterStatusNode = dom.byId('twitter_auth_status');
                    this._twitterStatus2Node = dom.byId('twitter_settings_auth');
                    this._twitterStatus3Node = dom.byId('twitter_legend_auth');
                    if(this._twitterStatusNode){
                        // sign in click
                        on(this._twitterStatusNode, 'a:click', lang.hitch(this, function (evt) {
                            this._twitterSignIn(evt);
                        }));
                    }
                    if(this._twitterStatus2Node){
                        // sign in click
                        on(this._twitterStatus2Node, 'a:click', lang.hitch(this, function (evt) {
                            this._twitterSignIn(evt);
                        }));
                    }
                    if(this._twitterStatus3Node){
                        // sign in click
                        on(this._twitterStatus3Node, 'a:click', lang.hitch(this, function (evt) {
                            this._twitterSignIn(evt);
                        }));
                    }
                    // authorize check
                    on(this._twitterLayer, 'authorize', lang.hitch(this, function (evt) {
                        var status, longStatus;
                        // user signed in
                        if (evt.authorized) {
                            status = '<a class="' + this.socialCSS.authStatus + '">' +this.config.i18n.general.switchAccount + '</a>';
                            if(this._twitterStatusNode){
                                this._twitterStatusNode.innerHTML = '';
                            }
                            if(this._twitterStatus2Node){
                                this._twitterStatus2Node.innerHTML = status;
                            }
                            if(this._twitterStatus3Node){
                                this._twitterStatus3Node.innerHTML = '';
                            }
                        } else {
                            status = '<a class="' + this.socialCSS.authStatus + '"><span class="'+ this.socialCSS.iconAttention + '"></span>' + this.config.i18n.general.signIn + '</a>';
                            longStatus = '<a class="' + this.socialCSS.authStatus + '"><span class="'+ this.socialCSS.iconAttention + '"></span>' + this.config.i18n.social.twitterSignIn + '</a>';
                            if(this._twitterStatusNode){
                                this._twitterStatusNode.innerHTML = status;
                            }
                            if(this._twitterStatus2Node){
                                this._twitterStatus2Node.innerHTML = status;
                            }
                            if(this._twitterStatus3Node){
                                this._twitterStatus3Node.innerHTML = longStatus;
                            }
                        }
                    }));
                    // twitter filtered by text
                    this._twitterLayer.watch("searchTerm", lang.hitch(this, function(){
                        this._updateTwitterFilter();
                    }));
                    this._updateTwitterFilter();
                }  
            },
            _setLayerInfoTitle: function(layer, title){
                // update legend info for layer
                if(this._mapLegend){
                    for(var i = 0; i < this._mapLegend.layerInfos.length; i++){
                        if(this._mapLegend.layerInfos[i].layer === layer){
                            this._mapLegend.layerInfos[i].title = title;
                            break;
                        }
                    }
                    this._mapLegend.refresh();
                }
            },
            _updateFlickrFilter: function(){
                var newTitle;
                if(this._flickrLayer.get("searchTerm")){
                    newTitle = this._flickrLayer.title + ' ' + this.config.i18n.social.photosFilteredBy + ' ' + this._flickrLayer.get("searchTerm");
                }
                else{
                    newTitle = this._flickrLayer.title;
                }
                // set layerInfo title
                this._setLayerInfoTitle(this._flickrLayer.featureLayer, newTitle);
            },
            _updateTwitterFilter: function(){
                var newTitle;
                if(this._twitterLayer.get("searchTerm")){
                    newTitle = this._twitterLayer.title + ' ' + this.config.i18n.social.tweetsFilteredBy + ' ' + this._twitterLayer.get("searchTerm");
                }
                else{
                    newTitle = this._twitterLayer.title;
                }
                // set layerInfo title
                this._setLayerInfoTitle(this._twitterLayer.featureLayer, newTitle);
            },
            _updateTwitterSearch: function(inputNode){
                this._twitterLayer.clear();
                this._twitterLayer.show();
                this._twitterLayer.set('searchTerm', inputNode.value);
                this._twitterLayer.update(0);
                this._twitterDialog.hide();
            },
            _updateFlickrSearch: function(inputNode){
                this._flickrLayer.clear();
                this._flickrLayer.show();
                this._flickrLayer.set('searchTerm', inputNode.value);
                this._flickrLayer.update(0);
                this._flickrDialog.hide();
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
            _twitterSignIn: function(evt){
                // force sign in
                if (this._twitterLayer.get("authorized")) {
                    // authorized user
                    this._twitterWindow(this.config.twitterSigninUrl, true);
                } else {
                    // unauthorized user
                    this._twitterWindow(this.config.twitterSigninUrl);
                }
                event.stop(evt);
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