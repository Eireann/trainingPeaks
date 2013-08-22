// setup some common config, and then make it available via commonJS or amdrequire
// in the browser it loads as amdrequire via requirejs,
// but on node.js it uses commonJS format so we can get it directly instead of async
(function () {

    var commonConfig = {
        paths:
        {

            // Our TP code
            "TP": "scripts/framework/TP",
            "framework": "scripts/framework",
            "models": "scripts/models",
            "views": "scripts/views",
            "controllers": "scripts/controllers",
            "layouts": "scripts/layouts",
            "helpers": "scripts/helpers",
            "utilities": "scripts/utilities",
            "dashboard": "scripts/dashboard", 
            
            // jQuery related, but not managed by bower yet ...
            "jqueryui": "../vendor/js/libs/jqueryui",
            "jqueryOutside": "../vendor/js/libs/jquery/jquery.ba-outside-events",
            "jqueryTimepicker": "../vendor/js/libs/jquery-timepicker/jquery.timepicker",
            "jqueryTextAreaResize": "../vendor/js/libs/jquery/jquery.autosize",
            "jquerySelectBox": "../vendor/js/libs/jquery/jquery.selectBoxIt.TP",
            "jqueryHtmlClean": "../vendor/js/libs/jquery/jquery.htmlClean.TP",

            // Underscore & Lodash (provided by Lodash)
            "lodash": "../vendor/js/libs/lodash.TP",
            "underscore": "../vendor/js/libs/lodash.TP",

            // Backbone and plugins
            "backbone": "../vendor/js/libs/backbone",
            "backbone.marionette": "../vendor/js/libs/backbone.marionette",
            "Backbone.Marionette.Handlebars": "../vendor/js/libs/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",
            "backbone.deepmodel": "../vendor/js/libs/backbone.deepmodel",
            "backbone.stickit": "../vendor/js/libs/backbone.stickit.TP",

            // Marionette plugins
            "marionette.faderegion": "scripts/plugins/marionette.faderegion",

            // Handlebars plugins
            "i18nprecompile": "../vendor/js/libs/i18nprecompile",
            "json2": "../vendor/js/libs/json2",

            // our vendor hbs has been patched to resolve string args, so don't use bower ...
            "hbs": "../vendor/js/libs/hbs.TP",

            // date utilities
            "moment": "../vendor/js/libs/moment/moment",

            // thread utilities
            "setImmediate": "../vendor/js/libs/setImmediate",

            // affiliates
            "affiliates": "scripts/affiliates",
            
            // Map & Graph
            "leaflet": "../vendor/js/libs/leaflet/leaflet-src",
            "leafletGoogleTiles": "../vendor/js/libs/leaflet/Google",

            // packery
            "packery": "../vendor/js/libs/packery/packery.pkgd.tp",
            "gridster": "../vendor/js/libs/jquery.gridster.TP",

            // jasmine test utils
            "testUtils": "../test/utils"
        },

        hbs:
        {
            templateExtension: "html",
            i18nDirectory: "templates/i18n/",
            helperPathCallback: function(name)
            {
                return "scripts/helpers/" + name;
            }
        },

        shim:
        {
            "backbone":
            {
                deps: ["underscore"],
                exports: "Backbone"
            },
            "backbone.marionette":
            {
                deps: ["backbone"],
                exports: "Marionette"
            },
            "backbone.stickit":
            {
                deps: ["backbone"],
                exports: "Backbone"
            },
            "backbone.deepmodel":
            {
                deps: ["backbone"],
                exports: "Backbone"
            },
            "jqueryOutside":
            {
                exports: ""
            },
            "setImmediate":
            {
                exports: "setImmediate"
            },
            "jqueryTextAreaResize":
            {
                exports: ""
            },
            "jquerySelectBox":
            {
                exports: ""
            }
        }

    };

    // exports for commonJS format, or define for amd format
    if (typeof exports === 'object') {
        module.exports = commonConfig;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return commonConfig;
        });
    }

    return commonConfig;
} ());



