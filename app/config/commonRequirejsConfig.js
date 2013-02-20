// setup some common config, and then make it available via commonJS or amdrequire
// in the browser it loads as amdrequire via requirejs,
// but on node.js it uses commonJS format so we can get it directly instead of async
(function () {

    var commonConfig = {
        paths:
        {
            "jqueryui": "../vendor/js/libs/jqueryui",
            "lodash": "../vendor/js/libs/lodash/lodash",
            "underscore": "../vendor/js/libs/lodash/lodash",

            "backbone": "../vendor/js/libs/backbone",
            "backbone.marionette": "../vendor/js/libs/backbone.marionette",
            "Backbone.Marionette.Handlebars": "../vendor/js/libs/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",
            "backbone.stickit": "../vendor/js/libs/backbone.stickit",

            "marionette.faderegion": "scripts/plugins/marionette.faderegion",

            "TP": "scripts/framework/TP",
            "framework": "scripts/framework",
            "models": "scripts/models",
            "views": "scripts/views",
            "controllers": "scripts/controllers",
            "layouts": "scripts/layouts",

            "i18nprecompile": "../vendor/js/libs/i18nprecompile",
            "json2": "../vendor/js/libs/json2",
            "hbs": "../vendor/js/libs/hbs",

            "moment": "../vendor/js/libs/moment/moment",
            
            "helpers": "scripts/helpers",
            "utilities": "scripts/utilities"
            
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



