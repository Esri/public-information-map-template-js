{
   "configurationSettings":[
      {
         "category":"<b>Choose template theme</b>",
         "fields":[
            {
               "type":"webmap",
               "label":"Select a map"
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
            },
            {
               "type":"string",
               "fieldName":"flickrRange",
               "tooltip":"Date Range",
               "label":"Date Range:",
               "options":[
                  {
                     "label":"Today",
                     "value":"today"
                  },
                  {
                     "label":"This Week",
                     "value":"this_week"
                  },
                  {
                     "label":"This Month",
                     "value":"this_month"
                  },
                  {
                     "label":"All Time",
                     "value":"all_time"
                  }
               ]
            }
         ]
      }
   ],
   "values":{
        "title":"",
        "showTitle":true,
        "showLegend": true,
        "showHomeButton": true,
        "showLocateButton":true,
        "showBasemapToggle": true,
        "showAboutDialog":true,
        "ShowShareDialog":true,
        "nextBasemap": "hybrid",
        "currentBasemap": "topo"
   }
}