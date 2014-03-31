requirejs.config(
{
    baseUrl: "app",
    paths: {
        TP: "scripts/framework/TP",
        framework: "scripts/framework",
        models: "scripts/models",
        views: "scripts/views",
        controllers: "scripts/controllers",
        layouts: "scripts/layouts",
        helpers: "scripts/helpers",
        utilities: "scripts/utilities",
        dashboard: "scripts/dashboard",
        calendar: "scripts/calendar",
        user: "scripts/user",
        quickview: "scripts/quickview",
        expando: "scripts/expando",
        shared: "scripts/shared",
        polyfills: "../vendor/js/polyfills",
        jqueryui: "../vendor/js/libs/jqueryui",
        jqueryOutside: "../vendor/js/libs/jquery/jquery.ba-outside-events",
        jqueryTimepicker: "../vendor/js/libs/jquery-timepicker/jquery.timepicker",
        jqueryTextAreaResize: "../vendor/js/libs/jquery/jquery.autosize",
        jqueryHtmlClean: "../vendor/js/libs/jquery/jquery.htmlClean.TP",
        jqueryFullScreen: "../vendor/js/libs/jquery/jquery.fullscreen",
        flot: "../bower_components/Flot",
        "jquery.flot.orderBars": "../vendor/js/libs/jquery.flot.orderBars",
        lodash: "../bower_components/lodash/dist/lodash.compat",
        underscore: "../bower_components/lodash/dist/lodash",
        "backbone.deepmodel": "../vendor/js/libs/backbone.deepmodel",
        "backbone.stickit": "../bower_components/backbone.stickit/backbone.stickit",
        "marionette.faderegion": "scripts/plugins/marionette.faderegion",
        originalSetImmediate: "../vendor/js/libs/setImmediate",
        setImmediate: "scripts/shared/patches/wrapSetImmediateForRollbar",
        affiliates: "scripts/affiliates",
        leaflet: "../vendor/leaflet/leaflet-src",
        leafletGoogleTiles: "../vendor/js/libs/leaflet/Google",
        packery: "../vendor/packery",
        testUtils: "../test/utils",
        chai: "../bower_components/chai/chai",
        mocha: "../bower_components/mocha/mocha",
        requirejs: "../bower_components/requirejs/require",
        sinon: "../bower_components/sinon/index",
        jquery: "../bower_components/jquery/dist/jquery",
        "sinon-chai": "../bower_components/sinon-chai/lib/sinon-chai",
        q: "../bower_components/q/q",
        "backbone.marionette.handlebars": "../bower_components/backbone.marionette.handlebars/backbone.marionette.handlebars",
        handlebars: "../bower_components/handlebars/handlebars",
        "handlebars.runtime": "../bower_components/handlebars/handlebars.runtime",
        text: "../bower_components/requirejs-text/text",
        i18n: "../bower_components/requirejs-i18n/i18n",
        "slick.core": "../bower_components/slickgrid/slick.core",
        "slick.grid": "../bower_components/slickgrid/slick.grid",
        lazy: "../bower_components/lazy.js/lazy",
        tpcore: "../tpcore/tpcore.min",
        backbone: "../bower_components/backbone/backbone",
        "backbone.babysitter": "../bower_components/backbone.babysitter/lib/amd/backbone.babysitter",
        "backbone.wreqr": "../bower_components/backbone.wreqr/lib/amd/backbone.wreqr",
        "backbone.marionette": "../bower_components/backbone.marionette/lib/core/amd/backbone.marionette",

        // We need to wrap moment.js to modify some functionality
        moment: "../bower_components/moment/moment",
        wrappedMoment: "scripts/utilities/wrappedMoment",

        // Reuseable components
        components: "scripts/components"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        },
        "backbone.deepmodel": {
            deps: [
                "backbone"
            ],
            exports: "Backbone"
        },
        jqueryOutside: [
            "jquery"
        ],
        originalSetImmediate: [

        ],
        jqueryTextAreaResize: [
            "jquery"
        ],
        jqueryTimepicker: [
            "jquery"
        ],
        jqueryFullScreen: [
            "jquery"
        ],
        "flot/jquery.flot": [
            "jquery"
        ],
        "flot/jquery.flot.crosshair": [
            "flot/jquery.flot"
        ],
        "flot/jquery.flot.resize": [
            "flot/jquery.flot"
        ],
        mocha: {
            exports: "mocha"
        },
        sinon: {
            exports: "sinon"
        },
        leaflet: {
            exports: "L"
        },
        lazy: {
            exports: "Lazy"
        },
        tpcore: {
            exports: "TP",
            deps: [
                "jquery",
                "underscore",
                "backbone",
                "flot/jquery.flot"
            ]
        },
        "slick.core": {
            exports: "Slick",
            deps: [
                "jquery"
            ]
        },
        "slick.grid": [
            "slick.core"
        ],
        packery: {
            exports: "Packery",
            deps: ['jquery']
        }
    }
});
