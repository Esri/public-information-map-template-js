{
  "configurationSettings": [{
    "category": "<b>General</b>",
    "fields": [{
      "type": "webmap",
      "label": "Select a map"
    }, {
      "type": "appproxies"
    }, {
      "type": "paragraph",
      "value": "Provide general information about your application with a title and description."
    }, {
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
      "type": "subcategory",
      "label": "Splash Screen"
    }, {
      "type": "paragraph",
      "value": "Shows a dialog window on application load."
    }, {
      "type": "conditional",
      "condition": false,
      "fieldName": "enableDialogModal",
      "label": "Enable Splash Screen",
      "tooltip": "Enable Splash Screen",
      "items": [{
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
    }]
  }, {
    "category": "<b>Options</b>",
    "fields": [{
      "type": "subcategory",
      "label": "Side Panel Settings"
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
    }, {
      "type": "paragraph",
      "value": "Enable or disable features in your application."
    }, {
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
      "type": "subcategory",
      "label": "Tools"
    }, {
      "type": "boolean",
      "fieldName": "enableHomeButton",
      "label": "Enable Home Button",
      "tooltip": "Enable Home Button"
    }, {
      "type": "boolean",
      "fieldName": "enableScalebar",
      "label": "Enable Scalebar on the map",
      "tooltip": "Enable Scalebar on the map"
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
      "fieldName": "enablePrintButton",
      "label": "Enable Print Button",
      "tooltip": "Enable Print Button"
    }, {
      "type": "boolean",
      "fieldName": "openOverviewMap",
      "label": "Open Overview Map Widget by default",
      "tooltip": "Open Overview Map Widget by default"
    }, {
      "type": "subcategory",
      "label": "Basemap Toggle"
    }, {
      "type": "paragraph",
      "value": "Choose which basemaps can be toggled on your application."
    }, {
      "type": "basemaps",
      "fieldName": "defaultBasemap",
      "tooltip": "Default selected basemap for this map.",
      "label": "Default Basemap"
    }, {
      "type": "basemaps",
      "fieldName": "nextBasemap",
      "tooltip": "Next selected basemap for this map.",
      "label": "Next Basemap"
    }, {
      "type": "subcategory",
      "label": "Map Notes Layer"
    }, {
      "type": "paragraph",
      "value": "Select a map notes layer for an interactive notes experience."
    }, {
      "type": "layerAndFieldSelector",
      "layerOptions": {
        "supportedTypes": ["FeatureCollection"],
        "geometryTypes": ["esriGeometryPoint", "esriGeometryLine", "esriGeometryPolygon"]
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
    }, {
      "type": "subcategory",
      "label": "Swipe Layer"
    }, {
      "type": "paragraph",
      "value": "A swipe layer can be confgiured to allow for dragging the layer from the side of the map to reveal it's data."
    }, {
      "type": "multilayerandfieldselector",
      "fieldName": "swipeLayer",
      "label": "Swipe Layer(s)"
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
    "category": "<b>Social Media Feeds</b>",
    "fields": [{
      "type": "subcategory",
      "label": "Instagram Options"
    }, {
      "type": "paragraph",
      "value": "Configure Instagram Layer options for your application."
    }, {
      "type": "paragraph",
      "value": "View Instagram photos on the map."
    }, {
      "type": "boolean",
      "fieldName": "enableInstagram",
      "label": "Enable Instagram Layer",
      "tooltip": "Enable Instagram Layer"
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "boolean",
      "fieldName": "instagramVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "subcategory",
      "label": "Flickr Options"
    }, {
      "type": "paragraph",
      "value": "Configure Flickr Layer options for your application."
    }, {
      "type": "paragraph",
      "value": "View Flickr photos on this map."
    }, {
      "type": "boolean",
      "fieldName": "enableFlickr",
      "label": "Enable Flickr Layer",
      "tooltip": "Enable Flickr Layer"
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "boolean",
      "fieldName": "flickrVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
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
    }, {
      "type": "subcategory",
      "label": "Twitter Options"
    }, {
      "type": "paragraph",
      "value": "Configure Twitter Layer options for your application."
    }, {
      "type": "paragraph",
      "value": "View Tweets on this map."
    }, {
      "type": "boolean",
      "fieldName": "enableTwitter",
      "label": "Enable Twitter Layer",
      "tooltip": "Enable Twitter Layer"
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "boolean",
      "fieldName": "twitterVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "paragraph",
      "value": "Use the following twitter search query. See <a href=\"http://support.twitter.com/articles/71577-how-to-use-advanced-twitter-search\" target=\"_blank\">Advanced search</a> and the query operators section of <a href=\"https://dev.twitter.com/rest/public/search\" target=\"_blank\">this topic</a> for more information."
    }, {
      "type": "string",
      "fieldName": "twitterSearch",
      "label": "Search Keywords",
      "tooltip": "Search Keywords",
      "placeHolder": ""
    }, {
      "type": "subcategory",
      "label": "Webcams.travel Options"
    }, {
      "type": "paragraph",
      "value": "Configure Webcams Layer options for your application."
    }, {
      "type": "paragraph",
      "value": "View up-to-date webcam photos from <a href=\"http://www.webcams.travel/\" target=\"_blank\">Webcams.travel</a>."
    }, {
      "type": "boolean",
      "fieldName": "enableWebcams",
      "label": "Enable Webcams Layer",
      "tooltip": "Enable Webcams Layer"
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "boolean",
      "fieldName": "webcamsVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
    }, {
      "type": "subcategory",
      "label": "YouTube Options"
    }, {
      "type": "paragraph",
      "value": "Configure YouTube Layer options for your application."
    }, {
      "type": "paragraph",
      "value": "View user contributed videos from YouTube."
    }, {
      "type": "boolean",
      "fieldName": "enableYouTube",
      "label": "Enable YouTube Layer",
      "tooltip": "Enable YouTube Layer"
    }, {
      "type": "paragraph",
      "value": "Show this layer by default."
    }, {
      "type": "boolean",
      "fieldName": "youtubeVisible",
      "label": "Visible",
      "tooltip": "Check this box to make the layer visible by default."
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
  }, {
    "category": "Search",
    "fields": [{
      "type": "paragraph",
      "value": "Specify which locators and layers can be searched in your application."
    }, {
      "type": "search",
      "fieldName": "searchConfig",
      "label": "Configure Search"
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
    "enableScalebar": false,
    "enablePrintButton": false,
    "nextBasemap": "hybrid",
    "defaultBasemap": "topo",
    "swipeType": "vertical",
    "swipeInvertPlacement": false,
    "enableInstagram": true,
    "instagramVisible": false,
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
    "youtubeSearch": "",
    "locationSearch": true
  }
}