{
  "configurationSettings": [{
    "category": "<b>Map</b>",
    "fields": [{
      "type": "webmap",
      "label": "Select a map"
    }]
  }, {
    "category": "<b>Choose Notes Layer</b>",
    "fields": [{
      "type": "paragraph",
      "value": "Select a map notes layer for an interactive notes experience."
    }, {
      "type": "layerAndFieldSelector",
      "layerOptions": {
        "supportedTypes": [
          "FeatureCollection"
        ],
        "geometryTypes": [
          "esriGeometryPoint",
          "esriGeometryLine",
          "esriGeometryPolygon"
        ]
      },
      "fieldName": "notesLayer",
      "label": "Map Notes Layer"
    }, {
      "type": "boolean",
      "fieldName": "hideNotesLayerPopups",
      "label": "Hide popups for this layer"
    }, {
      "type": "paragraph",
      "value": "Hides info windows for the notes layer."
    }]
  }, {
    "category": "<b>Choose Swipe Layer</b>",
    "fields": [{
      "type": "paragraph",
      "value": "Select layer to be swiped."
    }, {
      "type": "layerAndFieldSelector",
      "fieldName": "swipeLayer",
      "label": "Swipe Layer"
    }, {
      "type": "string",
      "fieldName": "swipeType",
      "tooltip": "Type",
      "label": "Type",
      "options": [{
        "label": "Vertical",
        "value": "vertical"
      }, {
        "label": "Horizontal",
        "value": "horizontal"
      }, {
        "label": "Scope",
        "value": "scope"
      }]
    }, {
      "type": "boolean",
      "fieldName": "swipeInvertPlacement",
      "label": "Invert Swipe Placement"
    }]
  }, {
    "category": "<b>General</b>",
    "fields": [{
      "type": "string",
      "fieldName": "title",
      "label": "Application Title",
      "tooltip": "Application Title",
      "placeHolder": "My Map"
    }, {
      "type": "string",
      "fieldName": "summary",
      "stringFieldOption": "richtext",
      "label": "Application Summary",
      "tooltip": "Map Summary",
      "placeHolder": "My Map"
    }, {
      "type": "string",
      "fieldName": "defaultPanel",
      "tooltip": "Default Menu Panel",
      "label": "Default Menu Panel",
      "options": [{
        "label": "Legend",
        "value": "legend"
      }, {
        "label": "About",
        "value": "about"
      }, {
        "label": "Layers",
        "value": "layers"
      }]
    }]
  }, {
    "category": "<b>Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableSummaryInfo",
      "label": "Enable Summary Information",
      "tooltip": "Enable Summary Information"
    }, {
      "type": "boolean",
      "fieldName": "enableModifiedDate",
      "label": "Enable Modified date",
      "tooltip": "Enable Modified date"
    }, {
      "type": "boolean",
      "fieldName": "enableViewsCount",
      "label": "Enable Views Count",
      "tooltip": "Enable Views Count"
    }, {
      "type": "boolean",
      "fieldName": "enableMoreInfo",
      "label": "Enable More Information link",
      "tooltip": "Enable More Information link"
    }, {
      "type": "boolean",
      "fieldName": "enableLegendPanel",
      "label": "Enable Legend Panel",
      "tooltip": "Enable Legend"
    }, {
      "type": "boolean",
      "fieldName": "enableAboutPanel",
      "label": "Enable About Panel",
      "tooltip": "Enable About Panel"
    }, {
      "type": "boolean",
      "fieldName": "enableLayersPanel",
      "label": "Enable Layers Panel",
      "tooltip": "Enable Layers Panel"
    }, {
      "type": "boolean",
      "fieldName": "enableHomeButton",
      "label": "Enable Home Button",
      "tooltip": "Enable Home Button"
    }, {
      "type": "boolean",
      "fieldName": "enableLocateButton",
      "label": "Enable Locate Button",
      "tooltip": "Enable Locate Button"
    }, {
      "type": "boolean",
      "fieldName": "enableBasemapToggle",
      "label": "Enable Basemap Toggle",
      "tooltip": "Enable Basemap Toggle"
    }, {
      "type": "boolean",
      "fieldName": "enableShareDialog",
      "label": "Enable Share Dialog",
      "tooltip": "Enable Share Dialog"
    }, {
      "type": "boolean",
      "fieldName": "enableBookmarks",
      "label": "Enable Bookmarks",
      "tooltip": "Enable Bookmarks"
    }, {
      "type": "boolean",
      "fieldName": "enableOverviewMap",
      "label": "Enable OverviewMap widget",
      "tooltip": "Enable OverviewMap widget"
    }, {
      "type": "boolean",
      "fieldName": "openOverviewMap",
      "label": "Open Overview Map Widget by default",
      "tooltip": "Open Overview Map Widget by default"
    }]
  }, {
    "category": "<b>Splash Screen</b>",
    "fields": [{
      "type": "paragraph",
      "value": "Shows a dialog window on application load."
    }, {
      "type": "boolean",
      "fieldName": "enableDialogModal",
      "label": "Enable Dialog Modal",
      "tooltip": "Enable Dialog Modal"
    }, {
      "type": "string",
      "fieldName": "dialogModalTitle",
      "label": "Dialog Title",
      "tooltip": "Dialog Title",
      "placeHolder": ""
    }, {
      "type": "string",
      "fieldName": "dialogModalContent",
      "stringFieldOption": "richtext",
      "label": "Dialog Content",
      "tooltip": "Dialog Content",
      "placeHolder": ""
    }]
  }, {
    "category": "<b>Basemap Widget</b>",
    "fields": [{
      "type": "string",
      "fieldName": "defaultBasemap",
      "tooltip": "Default selected basemap for this map.",
      "label": "Default Basemap",
      "options": [{
        "label": "Streets",
        "value": "streets"
      }, {
        "label": "Satellite",
        "value": "satellite"
      }, {
        "label": "Hybrid",
        "value": "hybrid"
      }, {
        "label": "Topographic",
        "value": "topo"
      }, {
        "label": "Gray",
        "value": "gray"
      }, {
        "label": "Oceans",
        "value": "oceans"
      }, {
        "label": "National Geographic",
        "value": "national-geographic"
      }, {
        "label": "OpenStreetMap",
        "value": "osm"
      }]
    }, {
      "type": "string",
      "fieldName": "nextBasemap",
      "tooltip": "Next selected basemap for this map.",
      "label": "Next Basemap",
      "options": [{
        "label": "Streets",
        "value": "streets"
      }, {
        "label": "Satellite",
        "value": "satellite"
      }, {
        "label": "Hybrid",
        "value": "hybrid"
      }, {
        "label": "Topographic",
        "value": "topo"
      }, {
        "label": "Gray",
        "value": "gray"
      }, {
        "label": "Oceans",
        "value": "oceans"
      }, {
        "label": "National Geographic",
        "value": "national-geographic"
      }, {
        "label": "OpenStreetMap",
        "value": "osm"
      }]
    }]
  }, {
    "category": "<b>Instagram Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableInstagram",
      "label": "Enable Instagram Layer",
      "tooltip": "Enable Instagram Layer"
    }, {
      "type": "paragraph",
      "value": "View Instagram photos on the map."
    }, {
      "type": "boolean",
      "fieldName": "instagramVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "string",
      "fieldName": "instagramTime",
      "tooltip": "Photos uploaded within the past",
      "label": "Photos uploaded within the past",
      "options": [{
        "label": "Day",
        "value": 1
      }, {
        "label": "2 Days",
        "value": 2
      }, {
        "label": "3 Days",
        "value": 3
      }, {
        "label": "4 Days",
        "value": 4
      }, {
        "label": "5 Days",
        "value": 5
      }, {
        "label": "6 Days",
        "value": 6
      }, {
        "label": "Week",
        "value": 7
      }]
    }]
  }, {
    "category": "<b>Flickr Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableFlickr",
      "label": "Enable Flickr Layer",
      "tooltip": "Enable Flickr Layer"
    }, {
      "type": "paragraph",
      "value": "View Flickr photos on this map."
    }, {
      "type": "boolean",
      "fieldName": "flickrVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "string",
      "fieldName": "flickrSearch",
      "label": "Search Keywords",
      "tooltip": "Search Keywords",
      "placeHolder": ""
    }, {
      "type": "string",
      "fieldName": "flickrTime",
      "tooltip": "Photos uploaded within the past",
      "label": "Photos uploaded within the past",
      "options": [{
        "label": "All Time",
        "value": "all_time"
      }, {
        "label": "Month",
        "value": "this_month"
      }, {
        "label": "Week",
        "value": "this_week"
      }, {
        "label": "Day",
        "value": "today"
      }]
    }]
  }, {
    "category": "<b>Twitter Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableTwitter",
      "label": "Enable Twitter Layer",
      "tooltip": "Enable Twitter Layer"
    }, {
      "type": "paragraph",
      "value": "View Tweets on this map."
    }, {
      "type": "boolean",
      "fieldName": "twitterVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "string",
      "fieldName": "twitterSearch",
      "label": "Search Keywords",
      "tooltip": "Search Keywords",
      "placeHolder": ""
    }, {
      "type": "paragraph",
      "value": "<a href=\"http://support.twitter.com/articles/71577-how-to-use-advanced-twitter-search\" target=\"_blank\">Advanced search</a>."
    }]
  }, {
    "category": "<b>Webcams.travel Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableWebcams",
      "label": "Enable Webcams Layer",
      "tooltip": "Enable Webcams Layer"
    }, {
      "type": "paragraph",
      "value": "View up-to-date webcam photos from <a href=\"http://www.webcams.travel/\" target=\"_blank\">Webcams.travel</a>."
    }, {
      "type": "boolean",
      "fieldName": "webcamsVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }]
  }, {
    "category": "<b>YouTube Options</b>",
    "fields": [{
      "type": "boolean",
      "fieldName": "enableYouTube",
      "label": "Enable YouTube Layer",
      "tooltip": "Enable YouTube Layer"
    }, {
      "type": "paragraph",
      "value": "View user contributed videos from YouTube."
    }, {
      "type": "boolean",
      "fieldName": "youtubeVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "string",
      "fieldName": "youtubeSearch",
      "label": "Search Keywords",
      "tooltip": "Search Keywords",
      "placeHolder": ""
    }, {
      "type": "string",
      "fieldName": "youtubeTime",
      "tooltip": "Videos uploaded within the past",
      "label": "Videos uploaded within the past",
      "options": [{
        "label": "All Time",
        "value": "all_time"
      }, {
        "label": "Month",
        "value": "this_month"
      }, {
        "label": "Week",
        "value": "this_week"
      }, {
        "label": "Day",
        "value": "today"
      }]
    }]
  }],
  "values": {
    "title": "",
    "enableDialogModal": false,
    "dialogModalTitle": "",
    "dialogModalContent": "",
    "enableSummaryInfo": true,
    "enableLegendPanel": true,
    "defaultPanel": "legend",
    "hideNotesLayerPopups": true,
    "enableAboutPanel": true,
    "enableHomeButton": true,
    "enableLocateButton": true,
    "enableBasemapToggle": true,
    "enableShareDialog": true,
    "enableViewsCount": true,
    "enableBookmarks": true,
    "enableOverviewMap": true,
    "openOverviewMap": false,
    "nextBasemap": "hybrid",
    "defaultBasemap": "topo",
    "swipeType": "vertical",
    "swipeInvertPlacement": false,
    "enableInstagram": true,
    "instagramVisible": false,
    "instagramTime": 5,
    "enableFlickr": true,
    "flickrVisible": false,
    "flickrSearch": "",
    "flickrTime": "all_time",
    "enableTwitter": true,
    "twitterVisible": false,
    "twitterSearch": "",
    "enableWebcams": true,
    "webcamsVisible": false,
    "enableYouTube": true,
    "youtubeVisible": false,
    "youtubeTime": "all_time",
    "youtubeSearch": ""
  }
}