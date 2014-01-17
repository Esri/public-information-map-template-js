define([], function() {
    //Default configuration settings for the applciation. This is where you"ll define things like a bing maps key,
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings
    //and url parameters.
    var defaults = {
        "appid": "",
        "webmap": "0eab5e8242e24ad0bed216bf50fead2c",
        "oauthappid": null,
        //Enter the url to the proxy if needed by the applcation. See the "Using the proxy page" help topic for details
        //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
        "proxyurl": "/resource-proxy/PHP/auth_proxy.php",
        //Example of a template specific property. If your template had several color schemes
        //you could define the default here and setup configuration settings to allow users to choose a different
        //color theme.
        "title":"",
        "showTitle":true,
        "showLegend": true,
        "showOperationalLegend":true,
        "showSocialLegend":true,
        "showArea":true,
        "showHomeButton": true,
        "showLocateButton":true,
        "showBasemapToggle": true,
        "showAboutDialog":true,
        "showAboutOnLoad":false,
        "ShowShareDialog":true,
        "showBookmarks": true,
        "showOverviewMap":true,
        "openOverviewMap":false,
        "showMapNotes":true,
        "nextBasemap": "hybrid",
        "currentBasemap": "topo",
        "notesLayerTitle":"Map Notes",
        "notesLayerId":"",
        "hideNotesLayerPopups":true,
        "showInstagram":true,
        "instagramChecked":true,
        "showFlickr":true,
        "flickrChecked":false,
        "flickrSearch":"",
        "showTwitter":true,
        "twitterChecked":true,
        "twitterSearch":"",
        "showWebcams":true,
        "webcamsChecked":true,
        "bitlyLogin": "esri",
        "bitlyKey": "R_65fd9891cd882e2a96b99d4bda1be00e",
        "twitterUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/index.php",
        "twitterSigninUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/sign_in.php",
        "flickr_key":"404ebea7d5bc27aa5251d1207620e99b",
        "webcams_key":"65939add1ebe8bc9cc4180763f5df2ca",
        "instagram_key":"288c36a1a42c49de9a2480a05d054619",
        "bannedUsersService": "http://services.arcgis.com/QJfoC7c7Z2icolha/ArcGIS/rest/services/fai/FeatureServer/2",
		"bannedWordsService": "http://tm2-elb-1378978824.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/SharedTools/Filter/MapServer/1",
		"flagMailServer": "http://tmappsevents.esri.com/Website/pim_fai/fai.php",
        //Enter the url to your organizations bing maps key if you want to use bing basemaps
        "bingmapskey": "",
        //Defaults to arcgis.com. Set this value to your portal or organization host name.
        "sharinghost": location.protocol + "//" + "www.arcgis.com"
    };
    return defaults;
});