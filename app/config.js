// Set the require.js configuration for your application.
require.config(
{
    deps: ["../vendor/jam/require.config", "main"],
    paths:
    {
        "jquery": "../vendor/jam/jquery/jquery",
        "lodash": "../vendor/jam/lodash/lodash",
        "underscore": "../vendor/jam/lodash/lodash",
        
        "backbone": "../vendor/js/libs/backbone",
        "backbone.marionette": "../vendor/js/libs/backbone.marionette",
        "Backbone.Marionette.Handlebars": "../vendor/jam/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",

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
