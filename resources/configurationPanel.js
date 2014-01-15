{
   "configurationSettings":[
      {
         "category":"<b>Choose Map</b>",
         "fields":[
            {
               "type":"webmap",
               "label":"Select a map"
            }
         ]
      },
      {
         "category":"<b>Choose Notes Layer</b>",
         "fields":[
            {
               "type":"layerAndFieldSelector",
               "layerOptions":{
                  "supportedTypes":[
                     "FeatureLayer"
                  ],
                  "geometryTypes":[
                     "esriGeometryPoint",
                     "esriGeometryLine",
                     "esriGeometryPolygon"
                  ]
               },
               "fieldName":"notesLayerId",
               "label":"Map Notes Layer"
            }
         ]
      },
      {
         "category":"<b>General</b>",
         "fields":[
            {
               "type":"string",
               "fieldName":"title",
               "label":"Application Title",
               "tooltip":"Application Title",
               "placeHolder":"My Map"
            },
            {
               "type":"boolean",
               "fieldName":"showTitle",
               "label":"Show Title",
               "tooltip":"Show Title"
            },
            {
               "type":"boolean",
               "fieldName":"showLegend",
               "label":"Show Legend Panel",
               "tooltip":"Show Legend"
            },
            {
               "type":"boolean",
               "fieldName":"showOperationalLegend",
               "label":"Show Operational Layers Legend",
               "tooltip":"Show Operational Layers Legend"
            },
            {
               "type":"boolean",
               "fieldName":"showSocialLegend",
               "label":"Show Social Layers Legend",
               "tooltip":"Show Social Layers Legend"
            },
            {
               "type":"boolean",
               "fieldName":"showArea",
               "label":"Show Area Side Panel",
               "tooltip":"Show Area Side Panel"
            },
            {
               "type":"boolean",
               "fieldName":"showHomeButton",
               "label":"Show Home Button",
               "tooltip":"Show Home Button"
            },
            {
               "type":"boolean",
               "fieldName":"showLocateButton",
               "label":"Show Locate Button",
               "tooltip":"Show Locate Button"
            },
            {
               "type":"boolean",
               "fieldName":"showBasemapToggle",
               "label":"Show Basemap Toggle",
               "tooltip":"Show Basemap Toggle"
            },
            {
               "type":"boolean",
               "fieldName":"showAboutDialog",
               "label":"Show About Dialog",
               "tooltip":"Show About Dialog"
            },
             {
               "type":"boolean",
               "fieldName":"showAboutOnLoad",
               "label":"Show About Dialog on load",
               "tooltip":"Show About Dialog on load"
            },
            {
               "type":"boolean",
               "fieldName":"ShowShareDialog",
               "label":"Show Share Dialog",
               "tooltip":"Show Share Dialog"
            },
            {
               "type":"boolean",
               "fieldName":"showBookmarks",
               "label":"Show Bookmarks",
               "tooltip":"Show Bookmarks"
            },
            {
               "type":"boolean",
               "fieldName":"showMapNotes",
               "label":"Show Map Notes",
               "tooltip":"Show Map Notes"
            },
             {
               "type":"boolean",
               "fieldName":"showOverviewMap",
               "label":"Show OverviewMap widget",
               "tooltip":"Show OverviewMap widget"
            },
             {
               "type":"boolean",
               "fieldName":"openOverviewMap",
               "label":"Overview Map Widget is open by default",
               "tooltip":"Overview Map Widget is open by default"
            }
             
            ]
      },
      {
         "category":"<b>Basemap Widget</b>",
         "fields":[ 
            {
               "type":"string",
               "fieldName":"nextBasemap",
               "tooltip":"Next selected basemap",
               "label":"Next Basemap",
               "options":[
                  {
                     "label":"Streets",
                     "value":"streets"
                  },
                  {
                     "label":"Satellite",
                     "value":"satellite"
                  },
                  {
                     "label":"Hybrid",
                     "value":"hybrid"
                  },
                  {
                     "label":"Topographic",
                     "value":"topo"
                  },
                  {
                     "label":"Gray",
                     "value":"gray"
                  },
                  {
                     "label":"Oceans",
                     "value":"oceans"
                  },
                  {
                     "label":"National Geographic",
                     "value":"national-geographic"
                  },
                  {
                     "label":"OpenStreetMap",
                     "value":"osm"
                  }
               ]
            },
            {
               "type":"string",
               "fieldName":"currentBasemap",
               "tooltip":"Currently selected basemap",
               "label":"Current Basemap",
               "options":[
                  {
                     "label":"Streets",
                     "value":"streets"
                  },
                  {
                     "label":"Satellite",
                     "value":"satellite"
                  },
                  {
                     "label":"Hybrid",
                     "value":"hybrid"
                  },
                  {
                     "label":"Topographic",
                     "value":"topo"
                  },
                  {
                     "label":"Gray",
                     "value":"gray"
                  },
                  {
                     "label":"Oceans",
                     "value":"oceans"
                  },
                  {
                     "label":"National Geographic",
                     "value":"national-geographic"
                  },
                  {
                     "label":"OpenStreetMap",
                     "value":"osm"
                  }
               ]
            }
         ]
      },
      {
         "category":"<b>Instagram Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"showInstagram",
               "label":"Show Instagram",
               "tooltip":"Show Instagram"
            },
            {
               "type":"paragraph",
               "value":"Show Instagram on this template."
            },
            {
               "type":"boolean",
               "fieldName":"instagramChecked",
               "label":"Checked",
               "tooltip":"Checked"
            },
            {
               "type":"paragraph",
               "value":"Turn this layer on by default."
            }
         ]
      },
      {
         "category":"<b>Flickr Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"showFlickr",
               "label":"Show Flickr",
               "tooltip":"Show Flickr"
            },
            {
               "type":"paragraph",
               "value":"Show Flickr on this template."
            },
            {
               "type":"boolean",
               "fieldName":"flickrChecked",
               "label":"Checked",
               "tooltip":"Checked"
            },
            {
               "type":"paragraph",
               "value":"Turn this layer on by default."
            },
            {
               "type":"string",
               "fieldName":"flickrSearch",
               "label":"Search Keywords",
               "tooltip":"Search Keywords",
               "placeHolder":""
            }
         ]
      },
      {
         "category":"<b>Twitter Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"showTwitter",
               "label":"Show Twitter",
               "tooltip":"Show Twitter"
            },
            {
               "type":"paragraph",
               "value":"Show Twitter on this template."
            },
            {
               "type":"boolean",
               "fieldName":"twitterChecked",
               "label":"Checked",
               "tooltip":"Checked"
            },
            {
               "type":"paragraph",
               "value":"Turn this layer on by default."
            },
            {
               "type":"string",
               "fieldName":"twitterSearch",
               "label":"Search Keywords",
               "tooltip":"Search Keywords",
               "placeHolder":""
            },
            {
               "type":"paragraph",
               "value":"<a href=\"http://support.twitter.com/articles/71577-how-to-use-advanced-twitter-search\" target=\"_blank\">Advanced search</a>."
            }
         ]
      },
      {
         "category":"<b>Webcams Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"showWebcams",
               "label":"Show Webcams",
               "tooltip":"Show Webcams"
            },
            {
               "type":"paragraph",
               "value":"Show Webcams on this template."
            },
            {
               "type":"boolean",
               "fieldName":"webcamsChecked",
               "label":"Checked",
               "tooltip":"Checked"
            },
            {
               "type":"paragraph",
               "value":"Turn this layer on by default."
            }
         ]
      }
   ],
   "values":{
      "title":"",
      "showLegend":true,
      "showOperationalLegend":true,
      "showSocialLegend":true,
      "showArea":true,
      "showHomeButton":true,
      "showLocateButton":true,
      "showBasemapToggle":true,
      "showAboutDialog":true,
      "showAboutOnLoad":false,
      "ShowShareDialog":true,
      "showBookmarks":true,
      "showOverviewMap":true,
      "openOverviewMap":false,
      "showMapNotes":true,
      "nextBasemap":"hybrid",
      "currentBasemap":"topo",
      "showInstagram":true,
      "instagramChecked":true,
      "showFlickr":false,
      "flickrChecked":true,
      "flickrSearch":"",
      "showTwitter":true,
      "twitterChecked":true,
      "twitterSearch":"",
      "showWebcams":false,
      "webcamsChecked":true
   }
}