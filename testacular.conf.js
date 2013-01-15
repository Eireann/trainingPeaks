// Testacular configuration

// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = 
[
    REQUIRE,
    REQUIRE_ADAPTER,
    JASMINE,
    JASMINE_ADAPTER,
    
    //SHIM STUFF
    "vendor/jam/jquery/jquery.js",
    "vendor/jam/lodash/lodash.underscore.min.js",
    "vendor/js/libs/backbone.js",
    "vendor/js/libs/backbone.marionette.js",

    // PATHS CONFIG
    { pattern: "vendor/js/libs/*.js", included: false },
    { pattern: "vendor/jam/*.js", included: false },
    { pattern: "vendor/jam/**/*.js", included: false },
    
    // SOURCE AND TEST MODULES
    { pattern: "app/*.js", included: false },
    { pattern: "app/scripts/**/*.js", included: false },
    { pattern: "test/specs/*.spec.js", included: false},
    
    "test/main.js"
];

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