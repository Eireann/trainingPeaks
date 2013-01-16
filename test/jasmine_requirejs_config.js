var requirejs = require('requirejs');
var define = requirejs.define;

// get out of spec dir and into /, from whatever spec subfolder we're in
var rootJsDir = __dirname.substring(0,__dirname.indexOf("/test"));

requirejs.config(
{
    // isBuild is used by hbs to load more synchronously, but still not completely synchronous :-(
    //isBuild: true,
    baseUrl: rootJsDir,
    //deps: ["hbs!templates/views/calendarDay", "test/specs/calendarDayViewDependencies.spec"],
    paths:
    {
        "lodash": "vendor/jam/lodash/lodash",
        "underscore": "vendor/jam/lodash/lodash",

        "document": "test/vendor/js/libs/document_jsdom",
        "window": "test/vendor/js/libs/window_jsdom",
        "jquery": "test/vendor/js/libs/jquery_jsdom",

        "backbone": "test/vendor/js/libs/backbone.amd",
        "backbone.eventbinder": "test/vendor/js/libs/backbone.eventbinder.amd",
        "backbone.babysitter": "test/vendor/js/libs/backbone.babysitter.amd",
        "backbone.wreqr": "test/vendor/js/libs/backbone.wreqr.amd",
        "backbone.marionette": "test/vendor/js/libs/backbone.marionette.amd",
        "Backbone.Marionette.Handlebars": "test/vendor/js/libs/backbone.marionette.handlebars.amd",

        "models": "app/scripts/models",
        "views": "app/scripts/views",
        "controllers": "app/scripts/controllers",
        "templates": "app/templates",

        "handlebars": "vendor/js/libs/Handlebars",
        "i18nprecompile": "vendor/js/libs/i18nprecompile",
        "json2": "vendor/js/libs/json2",
        "hbs": "test/vendor/js/libs/hbs",
        "text": "test/vendor/js/libs/text"
    },

    hbs:
    {
        templateExtension: "html",
        i18nDirectory: "templates/i18n/"
    },

});

