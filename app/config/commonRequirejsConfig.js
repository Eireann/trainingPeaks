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
 
            // jQuery related
            "jqueryui": "../vendor/js/libs/jqueryui",
            "jqueryOutside": "../vendor/js/libs/jquery/jquery.ba-outside-events",
            "jqueryAnimateShadow": "../vendor/js/libs/jquery/jquery.animate-shadow",

            // Underscore & Lodash (provided by Lodash)
            "lodash": "../vendor/js/libs/lodash/lodash",
            "underscore": "../vendor/js/libs/lodash/lodash",

            // Backbone and plugins
            "backbone": "../vendor/js/libs/backbone",
            "backbone.marionette": "../vendor/js/libs/backbone.marionette",
            "Backbone.Marionette.Handlebars": "../vendor/js/libs/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",
            "backbone.deepmodel": "../vendor/js/libs/backbone.deepmodel",
            "backbone.stickit": "../vendor/js/libs/backbone.stickit",

            // Marionette plugins
            "marionette.faderegion": "scripts/plugins/marionette.faderegion",

            // Handlebars plugins
            "i18nprecompile": "../vendor/js/libs/i18nprecompile",
            "json2": "../vendor/js/libs/json2",
            "hbs": "../vendor/js/libs/hbs",

            // date utilities
            "moment": "../vendor/js/libs/moment/moment",

            // thread utilities
            "setImmediate": "../vendor/js/libs/setImmediate"

            // lawnchair - for localStorage
           // "lawnchair": "../vendor/js/libs/lawnchair"
 
            
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
            "lawnchair":
            {
                exports: "Lawnchair"
            },
            "jqueryOutside":
            {
                exports: ""
            },
            "setImmediate":
            {
                exports: "setImmediate"
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



