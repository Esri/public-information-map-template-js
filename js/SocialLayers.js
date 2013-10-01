define([
    "dojo/ready", 
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/dom",
    "modules/TwitterLayer",
    "modules/FlickrLayer",
    "modules/WebcamsLayer",
    "dojo/on"
],
function(
    ready, 
    declare,  
    lang,
    event,
    dom,
    TwitterLayer,
    FlickrLayer,
    WebcamsLayer,
    on
) {
    return declare("", null, {
        constructor: function(settings) {
            // mix in settings            
            lang.mixin(this, settings);
            // Twitter
            this._twitterLayer = new TwitterLayer({
                map: this.map,
                visible: true,
                url: this.config.twitterUrl
            });
            this.map.addLayer(this._twitterLayer.featureLayer);
            this.layers.push({
                title: 'Twitter <a id="twitter_auth_status"></span><span class="clear"><span>',
                visibility: this._twitterLayer.featureLayer.visible,
                layerObject: this._twitterLayer.featureLayer
            });
            // Flickr
            this._flickrLayer = new FlickrLayer({
                map: this.map,
                visible: true,
                key: this.config.flickr_key
            });
            this.map.addLayer(this._flickrLayer.featureLayer);
            this.layers.push({
                title: "Flickr",
                visibility: this._flickrLayer.featureLayer.visible,
                layerObject: this._flickrLayer.featureLayer
            });
            // Webcams
            this._webcamsLayer = new WebcamsLayer({
                map: this.map,
                visible: true,
                key: this.config.webcams_key
            });
            this.map.addLayer(this._webcamsLayer.featureLayer);
            this.layers.push({
                title: "Webcams",
                visibility: this._webcamsLayer.featureLayer.visible,
                layerObject: this._webcamsLayer.featureLayer
            });
        },
        init: function(){
            this._twitterStatusNode = dom.byId('twitter_auth_status');
            if(this._twitterStatusNode){
                on(this._twitterStatusNode, 'click', lang.hitch(this, function(evt){
                    if(this._twitterLayer.get("authorized")){
                        // authorized user
                        this._twitterWindow(this.config.twitterSigninUrl, true);
                    }
                    else{
                        // unauthorized user
                        this._twitterWindow(this.config.twitterSigninUrl);
                    }
                    event.stop(evt);
                }));
            }
            on(this._twitterLayer, 'authorize', lang.hitch(this, function(evt){
                if(evt.authorized){
                    this._twitterStatusNode.innerHTML = 'Switch user';
                }
                else{
                    this._twitterStatusNode.innerHTML = 'Sign in';
                }
            }));
        },
        _twitterWindow: function(page, forceLogin) {
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
                window.oAuthCallback = function() {
                    window.location.reload();
                };
            }
        }
    });
});