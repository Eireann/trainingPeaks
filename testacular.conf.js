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
    "vendor/js/libs/backbone.js",
    "vendor/js/libs/backbone.marionette.js",

    "app/*.js",
"app/scripts/**/*.js"
];

// list of files to exclude
exclude =
[
  
];

preprocessors =
{
    "app/scripts/**/*.js": "coverage"
}

// test results reporter to use
// possible values: dots || progress
reporter = 'progress';

reporters =
[
    "coverage"
];

coverageReporter =
{
    type: "html",
    dir: "build/coverage/"
};

// web server port
port = process.env.PORT || 8000;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = ["PhantomJS"];

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;