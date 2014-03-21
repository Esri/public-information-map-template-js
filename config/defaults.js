define({
    //Default configuration settings for the applciation. This is where you"ll define things like a bing maps key,
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings
    //and url parameters.
    "appid": "",
    "webmap": "df8bcc10430f48878b01c96e907a1fc3",
    "oauthappid": null,
    //Enter the url to the proxy if needed by the applcation. See the "Using the proxy page" help topic for details
    // //developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
    "proxyurl": "",
    //Example of a template specific property. If your template had several color schemes
    //you could define the default here and setup configuration settings to allow users to choose a different
    //color theme.
    "title": "",
    "summary": "",
    "defaultPanel": "legend",
    "enableSummary": true,
    "enableTitle": true,
    "enableLegendPanel": true,
    "enableMapPanel": true,
    "enableLayersPanel": true,
    "enableHomeButton": true,
    "enableLocateButton": true,
    "enableBasemapToggle": true,
    "enableAboutDialog": true,
    "showAboutOnLoad": false,
    "enableShareDialog": true,
    "enableBookmarks": true,
    "enableOverviewMap": true,
    "openOverviewMap": false,
    "defaultBasemap": "topo",
    "nextBasemap": "hybrid",
    "notesLayer": {
        "id": "mapNotes_7330"
    },
    "hideNotesLayerPopups": true,
    "enableInstagram": true,
    "instagramVisible": false,
    "enableFlickr": true,
    "flickrVisible": false,
    "flickrSearch": "",
    "enableTwitter": true,
    "twitterVisible": false,
    "twitterSearch": "",
    "enableWebcams": true,
    "webcamsVisible": false,
    "bitlyLogin": "esri",
    "bitlyKey": "R_65fd9891cd882e2a96b99d4bda1be00e",
    "twitterUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/index.php",
    "twitterSigninUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/sign_in.php",
    "flickr_key": "404ebea7d5bc27aa5251d1207620e99b",
    "webcams_key": "65939add1ebe8bc9cc4180763f5df2ca",
    "instagram_key": "288c36a1a42c49de9a2480a05d054619",
    "bannedUsersService": location.protocol + "//services.arcgis.com/QJfoC7c7Z2icolha/ArcGIS/rest/services/fai/FeatureServer/2",
    "bannedWordsService": location.protocol + "//tmservices1.esri.com/ArcGIS/rest/services/SharedTools/Filter/MapServer/1",
    "flagMailServer": location.protocol + "//tmappsevents.esri.com/Website/pim_fai/fai.php",
    //Enter the url to your organizations bing maps key if you want to use bing basemaps
    "bingmapskey": "",
    //Defaults to arcgis.com. Set this value to your portal or organization host name.
    "sharinghost": location.protocol + "//" + "www.arcgis.com",
    //When true the template will query arcgis.com for default settings for helper services, units etc. If you 
    //want to use custom settings for units or any of the helper services set queryForOrg to false then enter
    //default values for any items you need using the helper services and units properties. 
    "queryForOrg": true,
    "localize": true,
    "urlItems": [
        "extent"
    ],
    "units": null,
    "helperServices": {
        "geometry": {
            "url": null
        },
        "printTask": {
            "url": null
        },
        "elevationSync": {
            "url": null
        },
        "geocode": [{
            "url": null
           }]
    }
});