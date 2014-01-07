define([
    "dojo/ready",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on"
],
    function (
        ready,
        declare,
        lang,
        dom,
        domConstruct,
        domStyle,
        on
    ) {
        return declare("", null, {
            constructor: function (settings) {
                // mix in settings            
                lang.mixin(this, settings);
                
            },
            init: function () {
                
            }
        });
    });