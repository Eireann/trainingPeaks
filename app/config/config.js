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

});
