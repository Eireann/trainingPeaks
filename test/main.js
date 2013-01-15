var tests = Object.keys(window.__testacular__.files).filter(function (file)
{
    return /\.spec\.js$/.test(file);
});

require(
{

    // !! Testacular serves files from '/base'
    baseUrl: "../",
    paths:
    {
        
        "jquery": "base/vendor/jam/jquery/jquery",
        "lodash": "base/vendor/jam/lodash/lodash",
        "underscore": "base/vendor/jam/lodash/lodash",
        "handlebars": "base/vendor/js/libs/Handlebars",

        "backbone": "base/test/vendor/js/libs/backbone.amd",
        "backbone.eventbinder": "base/test/vendor/js/libs/backbone.eventbinder.amd",
        "backbone.babysitter": "base/test/vendor/js/libs/backbone.babysitter.amd",
        "backbone.wreqr": "base/test/vendor/js/libs/backbone.wreqr.amd",
        "backbone.marionette": "base/test/vendor/js/libs/backbone.marionette.amd",
        "Backbone.Marionette.Handlebars": "base/vendor/jam/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",

        "i18nprecompile": "base/vendor/js/libs/i18nprecompile",
        "json2": "base/vendor/js/libs/json2",
        "hbs": "base/vendor/js/libs/hbs",

        require: 'base/base/vendor/js/libs/require',

        app: "base/app/app",
        views: "base/app/scripts/views",
        controllers: "base/app/scripts/controllers",
        models: "base/app/scripts/models",
        templates: "base/app/templates",
        template: "base/app/templates" // hbs looks for templates in /template/i18n
    }
},
tests,
function()
{
    window.__testacular__.start();
});