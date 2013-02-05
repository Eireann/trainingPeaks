// Configure RequireJS

// get our shared requirejs config
var path = require("path");
var rootJsDir = __dirname.substring(0, __dirname.indexOf(path.sep + "test"));

// get our common requirejs config - shared with browser app
var commonConfig = require(path.join(rootJsDir, "app/config/commonRequirejsConfig"));

// load this after we load commonConfig, so it loads in commonJS format instead of amd
var requirejs = require('requirejs');
requirejs.config({
    nodeRequire: require
});
var define = requirejs.define;
global.define = define;
global.requirejs = requirejs;

// use common config
requirejs.config(commonConfig);

// set base url get out of spec dir and into /app, from whatever spec subfolder we're in
requirejs.config({baseUrl: path.join(rootJsDir, "app")});

// get our mocha config
var mochaConfigFile = path.join(rootJsDir, "app/config/mochaRequirejsConfig");
var mochaConfig = require(mochaConfigFile);
requirejs.config(mochaConfig);


// require mocha
requirejs(
    ['mocha'],
    function(Mocha)
    {

        var mocha = new Mocha({
            ui: 'bdd'
        });
        // load some specs
        requirejs(
            ["specs/dependencies.spec"],
            function(deps)
            {
                console.log("got deps spec");
                console.log(deps);
                mocha.run();
            }
        );
    }
);
