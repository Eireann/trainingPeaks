var _ = require("underscore");

// get our common requirejs config - shared with browser app
var commonConfig = require("./commonRequirejsConfig");
_.extend(commonConfig, {
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
