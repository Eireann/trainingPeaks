var tests = Object.keys(window.__testacular__.files).filter(function (file)
{
    return /\.spec\.js$/.test(file);
});
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
        console.log('registering: ' + name);
        this.registry[name] = false;
    },
    completed: function(name)
    {
        console.log('completed: ' + name);
        this.registry[name] = true;
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
        for(var i = 0;i<dependencies.length;i++) {
            var modulePath = dependencies[i];
            theSpecLoader.register(modulePath);
            originalRequireJs([modulePath], function(completedDependency)
            {
                theSpecLoader.completed(modulePath);
            });
        }
    }

    registerDependencies(dependencies);
    originalRequireJs.apply(originalRequireJs, arguments);
};

requirejs.config = function () {
    return originalRequireJs.config.apply(originalRequireJs, arguments);
};

describe("Waiting for everything to load", function(done)
{
    it("Should run when all specs have loaded", function()
    {
        waitsFor(function()
        {
            return theSpecLoader.isFinished();
        }, "Spec loader never finished", 10000);

        runs(function()
        {
            expect(true).toBe(true);
        });
    });
});
requirejs(
tests,
function()
{
    console.log("In the callback");
    /*
    function whenReady()
    {
        if (theSpecLoader.isFinished())
        {
            console.log("Starting tests");
            window.__testacular__.start();
        } else
        {
            console.log("Specs not yet loaded, waiting");
            setTimeout(whenReady, 100);
        }
    }

    whenReady();
    */
});