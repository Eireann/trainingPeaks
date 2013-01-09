var jam = {
    "packages": [
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "jquery",
            "location": "../vendor/jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "lodash",
            "location": "../vendor/jam/lodash",
            "main": "./lodash.js"
        },
        {
            "name": "text",
            "location": "../vendor/jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "../vendor/jam/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.2.12",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "jquery",
            "location": "../vendor/jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "lodash",
            "location": "../vendor/jam/lodash",
            "main": "./lodash.js"
        },
        {
            "name": "text",
            "location": "../vendor/jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "../vendor/jam/underscore",
            "main": "underscore.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "jquery",
            "location": "../vendor/jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "lodash",
            "location": "../vendor/jam/lodash",
            "main": "./lodash.js"
        },
        {
            "name": "text",
            "location": "../vendor/jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "../vendor/jam/underscore",
            "main": "underscore.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}