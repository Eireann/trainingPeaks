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
        jquerySelectBox: "../vendor/js/libs/jquery/jquery.selectBoxIt.TP",
        jqueryHtmlClean: "../vendor/js/libs/jquery/jquery.htmlClean.TP",
        flot: "../vendor/js/libs/flot",
        "jquery.flot.orderBars": "../vendor/js/libs/jquery.flot.orderBars",
        lodash: "../bower_components/lodash/dist/lodash",
        underscore: "../bower_components/lodash/dist/lodash",
        backbone: "../vendor/js/libs/backbone",
        "backbone.marionette": "../vendor/js/libs/backbone.marionette",
        "backbone.deepmodel": "../vendor/js/libs/backbone.deepmodel",
        "backbone.stickit": "../vendor/js/libs/backbone.stickit.TP",
        "marionette.faderegion": "scripts/plugins/marionette.faderegion",
        i18nprecompile: "../vendor/js/libs/i18nprecompile",
        json2: "../vendor/js/libs/json2",
        moment: "../vendor/js/libs/moment/moment",
        originalSetImmediate: "../vendor/js/libs/setImmediate",
        setImmediate: "scripts/shared/patches/wrapSetImmediateForRollbar",
        affiliates: "scripts/affiliates",
        leaflet: "../vendor/js/libs/leaflet/leaflet-src",
        leafletGoogleTiles: "../vendor/js/libs/leaflet/Google",
        packery: "../vendor/js/libs/packery/packery.pkgd.tp",
        gridster: "../vendor/js/libs/jquery.gridster.TP",
        testUtils: "../test/utils",
        chai: "../bower_components/chai/chai",
        mocha: "../bower_components/mocha/mocha",
        requirejs: "../bower_components/requirejs/require",
        sinon: "../bower_components/sinon/index",
        jquery: "../bower_components/jquery/jquery",
        "sinon-chai": "../bower_components/sinon-chai/index",
        q: "../bower_components/q/q",
        "backbone.marionette.handlebars": "../bower_components/backbone.marionette.handlebars/backbone.marionette.handlebars",
        handlebars: "../bower_components/handlebars/handlebars",
        "handlebars.runtime": "../bower_components/handlebars/handlebars.runtime",
        text: "../bower_components/requirejs-text/text",
        i18n: "../bower_components/requirejs-i18n/i18n",
        tpcore: "../tpcore/tpcore.min"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        },
        backbone: {
            deps: [
                "underscore"
            ],
            exports: "Backbone"
        },
        "backbone.marionette": {
            deps: [
                "backbone"
            ],
            exports: "Marionette"
        },
        "backbone.stickit": {
            deps: [
                "backbone"
            ],
            exports: "Backbone"
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
        jquerySelectBox: [
            "jquery"
        ],
        jqueryTimepicker: [
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
        tpcore: {
            exports: "TP",
            deps: [
                "jquery",
                "underscore",
                "backbone",
                "flot/jquery.flot"
            ]
        }
    }
});
