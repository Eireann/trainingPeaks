define(
["./commonRequirejsConfig"],
function (commonConfig) {
    requirejs.config(commonConfig);
    requirejs.config(
    {
        baseUrl: '../app',
        deps: ["main", "Backbone.Marionette.Handlebars"],
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
    });

});
