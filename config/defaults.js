define({
  //Default configuration settings for the applciation. This is where you"ll define things like a bing maps key,
  //default web map, default app color theme and more. These values can be overwritten by template configuration settings
  //and url parameters.
  "appid": "",
  "webmap": "4b762458c7994fc08b4994a2dc76e9fc",
  "oauthappid": null,
  //Enter the url to the proxy if needed by the applcation. See the "Using the proxy page" help topic for details
  //developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
  "proxyurl": "",
  //Example of a template specific property. If your template had several color schemes
  //you could define the default here and setup configuration settings to allow users to choose a different
  //color theme.
  "title": "",
  "summary": "",
  "defaultPanel": "legend",
  "enableDialogModal": false,
  "dialogModalContent": "",
  "dialogModalTitle": "",
  "enableSummaryInfo": true,
  "enableLegendPanel": true,
  "enableAboutPanel": true,
  "enableLayersPanel": true,
  "enableHomeButton": true,
  "enableLocateButton": true,
  "enableBasemapToggle": true,
  "enableShareDialog": true,
  "enableBookmarks": true,
  "enableOverviewMap": true,
  "openOverviewMap": false,
  "enableModifiedDate": true,
  "enableViewsCount": true,
  "enableMoreInfo": true,
  "enablePrintButton": false,
  "defaultBasemap": "topo",
  "nextBasemap": "hybrid",
  //Go to http://www.arcgis.com/sharing/rest/content/items/df8bcc10430f48878b01c96e907a1fc3/data?f=pjson and input below the appropriate operational layer that you want to configure as swipe layer
  "swipeLayer": [{
    "fields": [],
    "id": ""
  }],
  "locationSearch": true,
  //When searchExtent is true the locator will prioritize results within the current map extent.
  "searchExtent": false,
  "searchLayers": [{
    "id": "",
    "fields": []
  }],
  "swipeType": "vertical",
  "swipeInvertPlacement": false,
  "hideNotesLayerPopups": true,
  "enableInstagram": true,
  "instagramVisible": false,
  "enableFlickr": true,
  "flickrVisible": false,
  "flickrSearch": "",
  "flickrTime": "",
  "enableTwitter": true,
  "twitterVisible": false,
  "twitterSearch": "",
  "enableWebcams": true,
  "webcamsVisible": false,
  "enableYouTube": true,
  "youtubeVisible": false,
  "youtubeSearch": "",
  "youtubeTime": "all_time", // today, this_week, this_month, all_time
  "bitlyLogin": "arcgis",
  "bitlyKey": "R_b8a169f3a8b978b9697f64613bf1db6d",
  "twitterUrl": "https://utility.arcgis.com/tproxy/proxy/1.1/search/tweets.json",
  "twitterSigninUrl": "https://utility.arcgis.com/tproxy/signin",
  "flickr_key": "404ebea7d5bc27aa5251d1207620e99b",
  "webcams_key": "65939add1ebe8bc9cc4180763f5df2ca",
  "instagramClientId": "47ce2d7ea1494adb98708f4b47319227",
  "instagramSigninUrl": "https://www.instagram.com/oauth/authorize",
  "youtube_key": "AIzaSyBvrlsx50mxX_W-Ra2cJ8PB0jKt0jACZfg",
  /*
    "bannedUsersService": "https://services.arcgis.com/QJfoC7c7Z2icolha/ArcGIS/rest/services/fai/FeatureServer/2",
    "bannedWordsService": "https://tmservices1.esri.com/ArcGIS/rest/services/SharedTools/Filter/MapServer/1",
    "flagMailServer": "https://tmappsevents.esri.com/Website/pim_fai/fai.php",
    */
  //Enter the url to your organizations bing maps key if you want to use bing basemaps
  "bingmapskey": "",
  //Defaults to arcgis.com. Set this value to your portal or organization host name.
  "sharinghost": "https://www.arcgis.com",
  //When true the template will query arcgis.com for default settings for helper services, units etc. If you 
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