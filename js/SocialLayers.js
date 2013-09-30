define([
    "dojo/ready", 
    "dojo/_base/declare",
    "dojo/_base/lang",
    "modules/TwitterLayer",
    "modules/FlickrLayer",
    "dojo/on"
],
function(
    ready, 
    declare,  
    lang,
    Twitter,
    Flickr,
    on
) {
    return declare("", null, {
        constructor: function(settings) {
            // mix in settings            
            lang.mixin(this, settings);
            
            // Twitter
            var twitter = new Twitter({
                map: this.map,
                visible: true,
                url: this.config.twitterUrl
            });
            this.map.addLayer(twitter.featureLayer);
            this.layers.push({
                title: "Twitter",
                visibility: twitter.featureLayer.visible,
                layerObject: twitter.featureLayer
            });
            
            // Flickr
            var flickr = new Flickr({
                map: this.map,
                visible: true,
                key: "404ebea7d5bc27aa5251d1207620e99b"
            });
            this.map.addLayer(flickr.featureLayer);
            this.layers.push({
                title: "Flickr",
                visibility: flickr.featureLayer.visible,
                layerObject: flickr.featureLayer
            });
            
            
        },
        _twitterWindow: function(page, forceLogin) {
            var pathRegex = new RegExp(/\/[^\/]+$/);
            var redirect_uri = encodeURIComponent(location.protocol + '//' + location.host + location.pathname.replace(pathRegex, '') + '/oauth-callback.html');
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