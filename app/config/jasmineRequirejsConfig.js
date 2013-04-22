var path = require("path");
var rootJsDir = __dirname.substring(0, __dirname.indexOf("/test"));
var _ = require('underscore');

var nodeConfig = require(path.join(rootJsDir, "app/config/nodeRequirejsConfig"));
// load this after we load nodeConfig, so it loads in node's commonJS format instead of amd

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
        if (fakeRegistry[key] === true)
        {
            loader.completed(key);
        } else
        {
            loader.register(key);
        }
    });
});

// override requirejs, so we call the spec loader's register/complete functions
var originalRequireJs = requirejs;
var requirejs = function(dependencies, callback)
{
    function registerDependencies(dependencies)
    {
        _.each(dependencies, function(modulePath)
        {
            theSpecLoader.register(modulePath);
            originalRequireJs([modulePath], function(completedDependency)
            {
                theSpecLoader.completed(modulePath);
            });
        });
    }

    registerDependencies(dependencies);
    originalRequireJs.call(originalRequireJs, dependencies, callback);
};

requirejs.config = function () {
    return originalRequireJs.config.apply(originalRequireJs, arguments);
};

// customize paths for testing
requirejs.config(nodeConfig);

// set baseUrl here, even though we have it in nodeConfig, or else code coverage doesn't work
requirejs.config({ baseUrl: path.join(rootJsDir, "app") });

global.requirejs = global.require = requirejs;
