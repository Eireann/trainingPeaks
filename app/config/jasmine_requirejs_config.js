var path = require("path");
var rootJsDir = __dirname.substring(0, __dirname.indexOf("/test"));
var _ = require('underscore');

// get our common requirejs config - shared with browser app
var commonConfig = require(path.join(rootJsDir,"app/config/commonRequirejsConfig"));

// load this after we load commonConfig, so it loads in commonJS format instead of amd
var requirejs = require('requirejs');
var define = requirejs.define;

// configuration for the requirejs spec loader in jasmine-node
specLoader.defineLoader(requirejs);

// fake registry until the spec loader module loads
fakeRegistry = {};
theSpecLoader = {
    register: function(name)
    {
        fakeRegistry[name] = false;
    },
    completed: function(name)
    {
        fakeRegistry[name] = true;
    }
};

// get the loader and update it with any of our fake registry values
requirejs(['jasmine-spec-loader'], function (loader) {
    theSpecLoader = loader;
    _.each(_.keys(fakeRegistry), function (key) {
        if (fakeRegistry[key] === true) {
            loader.completed(key);
        } else {
            loader.register(key);
        }
    });
});

// override requirejs, so we call the spec loader's register/complete functions
var originalRequireJs = requirejs;
var requirejs = function (dependencies, callback) {
    function registerDependencies(dependencies) {
        _.each(dependencies, function (modulePath) {
            theSpecLoader.register(modulePath);
            originalRequireJs([modulePath], function (completedDependency) {
                theSpecLoader.completed(modulePath);
            });
        });
    }

    registerDependencies(dependencies);
    originalRequireJs.apply(originalRequireJs, arguments);
};

requirejs.config = function () {
    return originalRequireJs.config.apply(originalRequireJs, arguments);
};


// use common config
requirejs.config(commonConfig);

// set base url get out of spec dir and into /app, from whatever spec subfolder we're in
requirejs.config({baseUrl: path.join(rootJsDir, "app")});

// customize paths for testing
requirejs.config(
{
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
        "hbs": "../test/vendor/js/libs/hbs"
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
}
);

// do we need some fake browser environment?
if (typeof global !== 'undefined' && typeof window === 'undefined')
{
    requirejs.config(
    {
        deps: ["browserEnvironment"]
    });
}

