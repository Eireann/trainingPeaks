console.log("Starting main");
console.log(require);
/*
requirejs.config({

    // !! Testacular serves files from '/base'
    baseUrl: "/base",
    paths:
    {

        "jquery": "vendor/js/libs/jquery/jquery",
        "lodash": "vendor/js/libs/lodash/lodash",
        "underscore": "vendor/js/libs/lodash/lodash",
        "handlebars": "vendor/js/libs/Handlebars",

        "backbone": "test/vendor/js/libs/backbone.amd",
        "backbone.eventbinder": "test/vendor/js/libs/backbone.eventbinder.amd",
        "backbone.babysitter": "test/vendor/js/libs/backbone.babysitter.amd",
        "backbone.wreqr": "test/vendor/js/libs/backbone.wreqr.amd",
        "backbone.marionette": "test/vendor/js/libs/backbone.marionette.amd",
        "Backbone.Marionette.Handlebars": "vendor/js/libs/Backbone.Marionette.Handlebars/backbone.marionette.handlebars",

        "i18nprecompile": "vendor/js/libs/i18nprecompile",
        "json2": "vendor/js/libs/json2",
        "hbs": "vendor/js/libs/hbs",


        app: "app/app",
        views: "app/scripts/views",
        controllers: "app/scripts/controllers",
        models: "app/scripts/models",
        templates: "app/templates",
        scripts: "app/scripts",
        template: "app/templates" // hbs looks for templates in /template/i18n
    }
});
*/
//require: 'vendor/js/libs/require',
theSpecLoader = {
    registry: {},
    register: function(name)
    {
        if (!this.registry.hasOwnProperty(name))
        {
            console.log('registering: ' + name);
            this.registry[name] = false;
        }
    },
    completed: function(name)
    {
        if (this.registry.hasOwnProperty(name) && !this.registry[name])
        {
            console.log('completed: ' + name);
            this.registry[name] = true;
        }
    },
    isFinished: function()
    {
        var self = this;
        var hasKeys = false;
        for (var key in this.registry)
        {
            hasKeys = true;
            if (!this.registry[key])
            {
                //console.log("Still waiting for " + key);
                return false;
            }
        }
        return hasKeys;
    }
};

// override requirejs, so we call the spec loader's register/complete functions
var originalRequireJs = requirejs;
var require = requirejs = function(dependencies, callback)
{
    function registerDependencies(dependencies)
    {
        for (var i = 0; i < dependencies.length; i++)
        {
            (function(j)
            {
                var modulePath = dependencies[j];
                theSpecLoader.register(modulePath);
                originalRequireJs([modulePath], function(completedDependency)
                {
                    theSpecLoader.completed(modulePath);
                });
            }(i));
        }
    }

    registerDependencies(dependencies);
    originalRequireJs.apply(originalRequireJs, arguments);
};
/*
var originalDefine = define;
var define = function()
{
    var name;
    var dependencies;
    var callback;

    if (arguments.length === 3)
    {
        name = arguments[0];
        dependencies = arguments[1];
        callback = arguments[2];
    } else
    {
        name = '';
        dependencies = arguments[0];
        callback = arguments[1];
    }

    function registerDefineDependencies(dependencies)
    {
        for(var i = 0;i<dependencies.length;i++) {
            theSpecLoader.register(modulePath);
            requirejs([modulePath], function(completedDependency)
            {
                theSpecLoader.completed(modulePath);
            });
        }
    }

    registerDefineDependencies(dependencies);
    originalDefine.apply(originalDefine, arguments);
};*/

requirejs.config = function () {
    return originalRequireJs.config.apply(originalRequireJs, arguments);
};

var specFiles = Object.keys(window.__testacular__.files).filter(function(file)
{
    return /\.spec\.js$/.test(file);
});

describe("Waiting for everything to load", function(done)
{
    it("Should run when all specs have loaded", function()
    {
        //requirejs(['jquery', 'underscore'], function($, _) { console.log("Got jquery and underscore"); });
        for (var i = 0; i < specFiles.length; i++)
        {
            var specFile = specFiles[i];
            specFile = specFile.replace("/base/", "");
            console.log("Loading specs " + specFile);
            requirejs([specFile], function(specModule) { console.log("Loaded " + specFile); });
        }

        waitsFor(function()
        {
            return theSpecLoader.isFinished();
        }, "Spec loader never finished", 5000);

        runs(function()
        {
            expect(true).toBe(true);
        });
    });
});
