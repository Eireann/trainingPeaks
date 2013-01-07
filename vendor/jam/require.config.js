var jam = {
    "packages": [
        {
            "name": "backbone",
            "location": "../vendor/jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "Backbone.Marionette",
            "location": "../vendor/jam/Backbone.Marionette",
            "main": "lib/amd/backbone.marionette.js"
        },
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "handlebars",
            "location": "../vendor/jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "../vendor/jam/hbt",
            "main": "hbt.js"
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
    "shim": {
        "backbone": {
            "deps": [
                "jquery",
                "lodash"
            ],
            "exports": "Backbone"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "backbone",
            "location": "../vendor/jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "Backbone.Marionette",
            "location": "../vendor/jam/Backbone.Marionette",
            "main": "lib/amd/backbone.marionette.js"
        },
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "handlebars",
            "location": "../vendor/jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "../vendor/jam/hbt",
            "main": "hbt.js"
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
    "shim": {
        "backbone": {
            "deps": [
                "jquery",
                "lodash"
            ],
            "exports": "Backbone"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "backbone",
            "location": "../vendor/jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "Backbone.Marionette",
            "location": "../vendor/jam/Backbone.Marionette",
            "main": "lib/amd/backbone.marionette.js"
        },
        {
            "name": "Backbone.Marionette.Handlebars",
            "location": "../vendor/jam/Backbone.Marionette.Handlebars",
            "main": "backbone.marionette.handlebars.js"
        },
        {
            "name": "handlebars",
            "location": "../vendor/jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "../vendor/jam/hbt",
            "main": "hbt.js"
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
    "shim": {
        "backbone": {
            "deps": [
                "jquery",
                "lodash"
            ],
            "exports": "Backbone"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}