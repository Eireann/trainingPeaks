// Testacular configuration
var _ = require('underscore');
var glob = require("glob");

// base path, that will be used to resolve files and exclude
basePath = "./";

// list of files / patterns to load in the browser
files = 
[
    //REQUIRE,
    //REQUIRE_ADAPTER,
    JASMINE,
    JASMINE_ADAPTER,

    //SHIM STUFF
    "build/debug/single.js"
    //"vendor/js/libs/jquery/jquery.js",
    //"vendor/js/libs/lodash/lodash.js",
    //"vendor/js/libs/backbone.js",
    //"vendor/js/libs/backbone.marionette.js",
];

// this tells testacular server what files it's allowed to serve - if it's not in this list and we require() it, test runner will fail
// using this instead of the built in glob matching in testacular files, because it was giving some errors
function addFileToList(file, included)
{
    files.push({ pattern: file, included: included ? true : false });
};

//var appFiles = glob.sync("app/**/*.js");
//var vendorFiles = glob.sync("vendor/js/libs/**/*.js");
var testFiles = glob.sync("test/specs/**/*spec.js");

//_.each(appFiles, function(file) { addFileToList(file, true); });
//_.each(vendorFiles, function(file) { addFileToList(file, true); });
_.each(testFiles, function(file) { addFileToList(file, true); });

files.push("test/main.js");

// list of files to exclude
exclude =
[
  
];

preprocessors =
{
    // "app/scripts/**/*.js": "coverage"
};

// test results reporter to use
// possible values: dots || progress
reporter = "progress";

/*
reporters =
[
    "coverage"
];

coverageReporter =
{
    type: "html",
    dir: "build/coverage/"
};
*/

// web server port
port = process.env.PORT || 8000;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_DEBUG;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = [ "Chrome" ];

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;