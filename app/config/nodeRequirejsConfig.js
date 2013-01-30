// setup some common config, and then make it available via commonJS or amdrequire
// in the browser it loads as amdrequire via requirejs,
// but on node.js it uses commonJS format so we can get it directly instead of async
(function () {
    var nodeConfig = {
        paths: {
            "document": "../test/js_global_dependencies/document_jsdom",
            "window": "../test/js_global_dependencies/window_jsdom",
            "localStorage": "../test/js_global_dependencies/localStorage",
            "browserEnvironment": "../test/js_global_dependencies/browserEnvironment",
            "jquery": "../test/vendor/js/libs/jquery_jsdom",
            "backbone": "../test/vendor/js/libs/backbone.amd",
            "backbone.eventbinder": "../test/vendor/js/libs/backbone.eventbinder.amd",
            "backbone.babysitter": "../test/vendor/js/libs/backbone.babysitter.amd",
            "backbone.wreqr": "../test/vendor/js/libs/backbone.wreqr.amd",
            "backbone.marionette": "../test/vendor/js/libs/backbone.marionette.amd",
            "Backbone.Marionette.Handlebars": "../test/vendor/js/libs/backbone.marionette.handlebars.amd",
            "hbs": "../test/vendor/js/libs/hbs"
        },

        shim:
        {
            "backbone":
            {
                deps: ["jquery", "underscore"],
                exports: "Backbone"
            },
            "backbone.marionette":
            {
                deps: ["backbone"],
                exports: "Marionette"
            },
            "jquery.mousewheel":
            {
                deps: ["jquery"],
                exports: "jquery"
            }
        }
    };

    // exports for commonJS format, or define for amd format
    if (typeof exports === 'object') {
        module.exports = nodeConfig;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return nodeConfig;
        });
    }

    return nodeConfig;
} ());



