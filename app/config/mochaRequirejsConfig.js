
// customize paths for testing
module.exports = {

    // mocha cache busting - do we need this?
    //urlArgs: "v=" + (new Date()).getTime(),

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
        "hbs": "../test/vendor/js/libs/hbs",
        "specs": "../test/mocha"
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

/*// do we need some fake browser environment?
if (typeof global !== 'undefined' && typeof window === 'undefined')
{
    requirejs.config(
    {
        deps: ["browserEnvironment"]
    });
}
*/
