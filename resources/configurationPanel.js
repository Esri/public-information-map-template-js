{
   "configurationSettings":[
      {
         "category":"<b>Map</b>",
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
               "type":"paragraph",
               "value":"Select a map notes layer for an interactive notes experience."
            },
            {
               "type":"layerAndFieldSelector",
               "layerOptions":{
                  "supportedTypes":[
                     "FeatureCollection"
                  ],
                  "geometryTypes":[
                     "esriGeometryPoint",
                     "esriGeometryLine",
                     "esriGeometryPolygon"
                  ]
               },
               "fieldName":"notesLayer",
               "label":"Map Notes Layer"
            },
            {
               "type":"boolean",
               "fieldName":"hideNotesLayerPopups",
               "label":"Hide popups for this layer",
               "tooltip":"Hide info windows for notes layer"
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
               "type":"string",
               "fieldName":"summary",
               "stringFieldOption":"richtext",
               "label":"Application Description",
               "tooltip":"Application Description",
               "placeHolder":"My Map"
            },
            {
               "type":"string",
               "fieldName":"defaultMenu",
               "tooltip":"Default Menu Panel",
               "label":"Default Menu Panel",
               "options":[
                  {
                     "label":"Featured Locations",
                     "value":"locations"
                  },
                  {
                     "label":"layers",
                     "value":"Layers"
                  },
                  {
                     "label":"Legend",
                     "value":"legend"
                  }
               ]
            }
         ]
      },
      {
         "category":"<b>Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"enableTitle",
               "label":"Enable Title",
               "tooltip":"Enable Title"
            },
            {
               "type":"boolean",
               "fieldName":"enableSummary",
               "label":"Enable Summary Description",
               "tooltip":"Enable Summary Description"
            },
            {
               "type":"boolean",
               "fieldName":"enableLegendPanel",
               "label":"Enable Legend Panel",
               "tooltip":"Enable Legend"
            },
            {
               "type":"boolean",
               "fieldName":"enableMapPanel",
               "label":"Enable Featured Locations Panel",
               "tooltip":"Enable Featured Locations Panel"
            },
            {
               "type":"boolean",
               "fieldName":"enableLayersPanel",
               "label":"Enable Layers Panel",
               "tooltip":"Enable Layers Panel"
            },
            {
               "type":"boolean",
               "fieldName":"enableHomeButton",
               "label":"Enable Home Button",
               "tooltip":"Enable Home Button"
            },
            {
               "type":"boolean",
               "fieldName":"enableLocateButton",
               "label":"Enable Locate Button",
               "tooltip":"Enable Locate Button"
            },
            {
               "type":"boolean",
               "fieldName":"enableBasemapToggle",
               "label":"Enable Basemap Toggle",
               "tooltip":"Enable Basemap Toggle"
            },
            {
               "type":"boolean",
               "fieldName":"enableAboutDialog",
               "label":"Enable About Dialog",
               "tooltip":"Enable About Dialog"
            },
            {
               "type":"boolean",
               "fieldName":"showAboutOnLoad",
               "label":"Enable About Dialog on load",
               "tooltip":"Enable About Dialog on load"
            },
            {
               "type":"boolean",
               "fieldName":"enableShareDialog",
               "label":"Enable Share Dialog",
               "tooltip":"Enable Share Dialog"
            },
            {
               "type":"boolean",
               "fieldName":"enableBookmarks",
               "label":"Enable Bookmarks",
               "tooltip":"Enable Bookmarks"
            },
            {
               "type":"boolean",
               "fieldName":"enableOverviewMap",
               "label":"Enable OverviewMap widget",
               "tooltip":"Enable OverviewMap widget"
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
               "tooltip":"Next selected basemap for this map.",
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
               "tooltip":"Default selected basemap for this map.",
               "label":"Default Basemap",
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
               "fieldName":"enableInstagram",
               "label":"Enable Instagram Layer",
               "tooltip":"Enable Instagram Layer"
            },
            {
               "type":"paragraph",
               "value":"View Instagram photos on the map."
            },
            {
               "type":"boolean",
               "fieldName":"instagramChecked",
               "label":"Visible",
               "tooltip":"Check this box to make the layer visible by default."
            },
            {
               "type":"paragraph",
               "value":"Show this layer by default."
            }
         ]
      },
      {
         "category":"<b>Flickr Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"enableFlickr",
               "label":"Enable Flickr Layer",
               "tooltip":"Enable Flickr Layer"
            },
            {
               "type":"paragraph",
               "value":"View Flickr photos on this map."
            },
            {
               "type":"boolean",
               "fieldName":"flickrChecked",
               "label":"Visible",
               "tooltip":"Check this box to make the layer visible by default."
            },
            {
               "type":"paragraph",
               "value":"Show this layer by default."
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
               "fieldName":"enableTwitter",
               "label":"Enable Twitter Layer",
               "tooltip":"Enable Twitter Layer"
            },
            {
               "type":"paragraph",
               "value":"View Tweets on this map."
            },
            {
               "type":"boolean",
               "fieldName":"twitterChecked",
               "label":"Visible",
               "tooltip":"Check this box to make the layer visible by default."
            },
            {
               "type":"paragraph",
               "value":"Show this layer by default."
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
         "category":"<b>Webcams.travel Options</b>",
         "fields":[
            {
               "type":"boolean",
               "fieldName":"enableWebcams",
               "label":"Enable Webcams Layer",
               "tooltip":"Enable Webcams Layer"
            },
            {
               "type":"paragraph",
               "value":"View up-to-date webcam photos from <a href=\"http://www.webcams.travel/\" target=\"_blank\">Webcams.travel</a>."
            },
            {
               "type":"boolean",
               "fieldName":"webcamsChecked",
               "label":"Visible",
               "tooltip":"Check this box to make the layer visible by default."
            },
            {
               "type":"paragraph",
               "value":"Show this layer by default."
            }
         ]
      }
   ],
   "values":{
      "title":"",
      "enableSummary":true,
      "enableLegendPanel":true,
      "hideNotesLayerPopups":true,
      "enableMapPanel":true,
      "enableHomeButton":true,
      "enableLocateButton":true,
      "enableBasemapToggle":true,
      "enableAboutDialog":true,
      "showAboutOnLoad":false,
      "enableShareDialog":true,
      "enableBookmarks":true,
      "enableOverviewMap":true,
      "openOverviewMap":false,
      "nextBasemap":"hybrid",
      "currentBasemap":"topo",
      "enableInstagram":true,
      "instagramChecked":false,
      "enableFlickr":true,
      "flickrChecked":false,
      "flickrSearch":"",
      "enableTwitter":true,
      "twitterChecked":false,
      "twitterSearch":"",
      "enableWebcams":true,
      "webcamsChecked":false
   }
}