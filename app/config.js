// Set the require.js configuration for your application.
require.config(
{
    //deps: ["../vendor/jam/require.config", "main"],
    deps: ["main"],
    paths:
    {
        "jquery": "../vendor/js/libs/jquery/jquery",
        "lodash": "../vendor/js/libs/lodash/lodash",
        "underscore": "../vendor/js/libs/lodash/lodash",
        
        "backbone": "../vendor/js/libs/backbone",
        "backbone.marionette": "../vendor/js/libs/backbone.marionette",
        "Backbone.Marionette.Handlebars": "../vendor/js/libs/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",

        "models": "scripts/models",
        "views": "scripts/views",
        "controllers": "scripts/controllers",
        
        "i18nprecompile": "../vendor/js/libs/i18nprecompile",
        "json2": "../vendor/js/libs/json2",
        "hbs": "../vendor/js/libs/hbs"
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
            deps: [ "backbone" ],
            exports: "Marionette"
        }
    },
    hbs:
    {
        templateExtension: "html",
        i18nDirectory: "templates/i18n/"
    }
});
