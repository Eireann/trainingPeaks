define(
["./commonRequirejsConfig"],
function (commonConfig) {
    requirejs.config(commonConfig);
    requirejs.config(
    {
        baseUrl: './app',
        deps: ["main", "Backbone.Marionette.Handlebars"],
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
            }
        }
    });

    if ('live' !== window.apiRoot)
    {
        requirejs.config({
            urlArgs: "ts=" + (new Date()).getTime()
        });
    }

});
