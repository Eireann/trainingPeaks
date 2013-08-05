(function()
{

    /*
    extend common config with some paths for testing
    */
    var _ = require('underscore');

    // get our common requirejs config - shared with browser app
    var path = require('path');
    var commonConfig = require("./commonRequirejsConfig");
    var rootJsDir = __dirname.substring(0, __dirname.indexOf("/test"));
    commonConfig.baseUrl = path.join(rootJsDir, "app");
    _.extend(commonConfig.paths,
        {
            "document": "../test/js_global_dependencies/document_jsdom",
            "window": "../test/js_global_dependencies/window_jsdom",
            "localStorage": "../test/js_global_dependencies/localStorage",
            "browserEnvironment": "../test/js_global_dependencies/browserEnvironment",
            "jquery": "../test/vendor/js/libs/jquery_jsdom",
            //"lawnchair": "../test/vendor/js/libs/fake_lawnchair",
            "backbone": "../test/vendor/js/libs/backbone.amd",
            "backbone.eventbinder": "../test/vendor/js/libs/backbone.eventbinder.amd",
            "backbone.babysitter": "../test/vendor/js/libs/backbone.babysitter.amd",
            "backbone.wreqr": "../test/vendor/js/libs/backbone.wreqr.amd",
            "backbone.marionette": "../test/vendor/js/libs/backbone.marionette.amd",
            "Backbone.Marionette.Handlebars": "../test/vendor/js/libs/backbone.marionette.handlebars.amd",
            "hbs": "../test/vendor/js/libs/hbs"
        }
    );

    commonConfig.deps = ["browserEnvironment", "jquery", "Backbone.Marionette.Handlebars"];

    // exports for commonJS format, or define for amd format
    if (typeof exports === 'object') {
        module.exports = commonConfig;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return commonConfig;
        });
    }

    global.apiConfig = {
        configuration: "local",
        wwwRoot: "localhost",
        apiRoot: "localhost",
        oAuthRoot: "localhost",
        buildNumber: "local_test",
        gaAccount: "",
        coachUpgradeURL: "",
        upgradeURL:""
    };

    return commonConfig;

}());