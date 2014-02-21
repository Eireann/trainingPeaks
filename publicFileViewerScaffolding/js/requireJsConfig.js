requirejs.config(
{
    baseUrl: "js",
    paths: {

        // utils
        lodash: "libs/lodash/dist/lodash",
        jquery: "libs/jquery/jquery",

        // framework
        backbone: "libs/backbone/backbone",
        marionette: "libs/marionette/backbone.marionette",

        // testing
        mocha: "libs/mocha/mocha",
        chai: "libs/chai/chai",
        sinon: "libs/sinon/index",
        "sinon-chai": "libs/sinon-chai/index",
        text: "libs/requirejs-text/text"
        
    },
    shim: {

        // framework
        backbone: {
            deps: ["jquery"],
            exports: "Backbone"
        },

        marionette: {
            deps: ["backbone", "lodash"],
            exports: "Marionette"
        },

        // testing
        mocha: {
            exports: "mocha"
        },
        sinon: {
            exports: "sinon"
        }

    }
});
