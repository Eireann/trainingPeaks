var _ = require("underscore");

// get our common requirejs config - shared with browser app
var commonConfig = require("./app/commonRequirejsConfig");

_.extend(commonConfig, {
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

module.exports = commonConfig;
