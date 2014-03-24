var _ = require("lodash");
var path = require("path");
var fs = require("fs");


var currentDate = new Date().toISOString();

module.exports = function(grunt)
{
    grunt.initConfig(
    {
        jshint:
        {
            source:
            {
                src: [ "app/**/*.js" ]
            },
            build:
            {
                src: [ "Gruntfile.js" ],
                options:
                {
                    node: true
                }
            },
            tests:
            {
                src: [ "test/**/*.js", "!test/utils/AppTestData/**/*.js" ],
                options:
                {
                    expr: true, // Allow chai syntax
                    globals:
                    {
                        "describe": false,
                        "it": false,
                        "xdescribe": false,
                        "xit": false,
                        "before": false,
                        "beforeEach": false,
                        "after": false,
                        "afterEach": false,


                        "apiConfig": false,
                        "theMarsApp": false,
                        "requirejs": false,
                        "define": false,
                        "require": false,

                        // Remove these when time allows
                        "createSpyObj": false,
                        "expect": false,
                        "sinon": false,
                        "Q": false,
                        "$": false,
                        "_": false
                    }
                }
            },
            options:
            {
                scripturl: true,
                curly: false,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                devel: true, // TODO: Remove so we don't end up with console.log everywhere
                sub: true,
                undef: true,
                globals:
                {
                    "apiConfig": false,
                    "theMarsApp": false,
                    "requirejs": false,
                    "define": false,
                    "require": false,
                    "WebFont": false,
                    "module": false
                }
            }
        },

        webfont:
        {
            icons:
            {
                src: "assets/icons-src/*.svg",
                dest: "assets/icons",
                options:
                {
                    stylesheet: "scss",
                    embed: true,
                    relativeFontPath: "../../assets/icons/",
                    htmlDemo: false
                }
            }
        },

        compass: //SASS/SCSS
        {
            debug:
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/debug/app/css",
                    outputStyle: "expanded",
                    require: "zurb-foundation",
                    imagesDir: "assets/images"
                }
            },
            build:
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/release/app/css",
                    outputStyle: "compressed",
                    require: "zurb-foundation",
                    imagesDir: "assets/images"
                }
            },
            components:
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/components/css",
                    outputStyle: "compressed",
                    require: "zurb-foundation",
                    imagesDir: "assets/images"
                }
            },
            components_debug:
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/components/css",
                    outputStyle: "expanded",
                    require: "zurb-foundation",
                    imagesDir: "assets/images"
                }
            }
        },

        requirejs:
        {
            build:
            {
                options:
                {
                    mainConfigFile: "app/config.js",
                    out: "build/release/single.js",
                    baseUrl: "app",
                    name: "main",
                    include: [
                        "../bower_components/almond/almond"
                    ],
                    stubModules: ["text"],
                    wrap: false,
                    optimize: "none",
                    useSourceUrl: true
                }
            },

            applyTrainingPlan:
            {
                options:
                {
                    mainConfigFile: "app/config.js",
                    out: "build/components/js/applyTrainingPlan.js",
                    baseUrl: "app",
                    name: "components/applyTrainingPlan/js/applyTrainingPlan",
                    deps: [
                        "wrappedMoment"
                    ],
                    include: [
                        "../bower_components/almond/almond",
                       "components/applyTrainingPlan/js/applyTrainingPlanLoader"
                    ],
                    stubModules: ["text"],
                    wrap: false,
                    optimize: "none",
                    useSourceUrl: true
                }
            },

            publicFileViewer:
            {
                options:
                {
                    mainConfigFile: "app/config.js",
                    out: "build/components/js/publicFileViewer.js",
                    baseUrl: "app",
                    name: "components/publicFileViewer/js/publicFileViewer",
                    deps: [
                        "wrappedMoment"
                    ],
                    include: [
                        "../bower_components/almond/almond",
                       "components/publicFileViewer/js/publicFileViewerLoader"
                    ],
                    stubModules: ["text"],
                    wrap: false,
                    optimize: "none",
                    useSourceUrl: true
                }
            } 
        },

        /*
         * The minification task uses the uglify library.
         */
        uglify:
        {
            options:
            {
                sourceMap: function(dest)
                {
                    return dest + ".map";
                },
                sourceMappingURL: function(dest)
                {
                    return path.basename(dest) + ".map";
                },
                sourceMapPrefix: 2,
                beautify:
                {
                    beautify: false,
                    semicolons: false
                }
            },
            build:
            {
                dest: "build/release/single.min.js",
                src: "build/release/single.js"
            },
            tpcore:
            {
                dest: "tpcore/tpcore.min.js",
                src: [
                    "tpcore/lib/main.js",
                    "tpcore/lib/units.js",
                    "tpcore/lib/planpreview.js",
                ]
            },
            "tpcore.deps":
            {
                dest: "tpcore/tpcore.deps.min.js",
                src: [
                    "bower_components/lodash/dist/lodash.underscore.js",
                    "bower_components/backbone/backbone.js",
                    "vendor/js/libs/flot/jquery.flot.js",
                    "bower_components/flot-axislabels/jquery.flot.axislabels.js"
                ]
            },
            components:
            {
                files: [{
                    expand: true,
                    cwd: "build/components",
                    src: "**/*.js",
                    dest: "build/components"
                }]
            }
        },

        targethtml:
        {
            build:
            {
                src: "index.html",
                dest: "build/release/index.html",
                options:
                {
                    curlyTags:
                    {
                        apiConfig: grunt.file.read(grunt.option("dev") ? "apiConfig.dev.js" : "apiConfig.js")
                    }
                }
            },
            build_debug:
            {
                src: "index.html",
                dest: "build/release/index.html"
            },
            build_debug_min:
            {
                src: "index.html",
                dest: "build/release/index.html"
            }
        },

        watch:
        {
            compass: {
                files: ["Gruntfile.js", "app/scss/**/*.scss"],
                tasks: ["compass:debug", "compass:components_debug"]
            },
            components: {
                files: ["app/scripts/components/**/*.html", "app/scripts/components/**/*.js"],
                tasks: ["components:debug"]
            }
        },

        clean:
        {
            debug:
            {
                src: ["build/debug"]
            },
            build:
            {
                src: ["build"]
            },
            coverage:
            {
                src: ["coverage"]
            },
            post_build:
            {
                src: ["build/**/single.js"]
            },
            components:
            {
                src: ["build/components"]
            }
        },

        copy:
        {
            debug:
            {
                dest: "build/debug/",
                src: [ "favicon.ico", "vendor/leaflet/*.css", "vendor/leaflet/images/*", "assets/fonts/**", "assets/icons/**", "assets/images/**", "app/scripts/affiliates/**"]
            },

            build_common:
            {
                dest: "build/release/",
                src: [ "favicon.ico", "vendor/leaflet/*.css", "vendor/leaflet/images/*", "assets/fonts/**", "assets/icons/**", "assets/images/**", "app/scripts/affiliates/**"]
            },

            build_debug:
            {
                dest: "build/release/",
                src: ["apiConfig.dev.js"]
            },

            build:
            {
                dest: "build/release/",
                src: ["web.config"]
            },

            // stuff that needs to get instrumented for test coverage to work
            pre_instrument:
            {
                dest: "coverage/",
                src: ["test/**", "app/**", "tpcore/*.min.js*"]
            },

            // stuff that needs to be clean and not modified by test coverage instrumentation
            post_instrument:
            {
                dest: "coverage/",
                src: ["bower_components/**", "vendor/**", "app/Handlebars.js", "app/config/**", "apiConfig.dev.js"]
            },

            build_coverage:
            {
                dest: "build/debug/",
                src: ["coverage/lcov-report/**"]
            },

            components:
            {
                dest: "build/components/",
                src: ["app/scripts/components/componentPreviewer/**/*.html"],
                expand: true,
                flatten: true
            }
        },

        instrument: {
            files: "app/scripts/**/*.js",
            options: {
                basePath: 'coverage'
            }
        },

        storeCoverage : {
            options: {
                dir: 'coverage/coverage'
            }
        },

        makeReport: {
            src: 'coverage/coverage/**/*.json',
            options : {
                type: 'lcov',
                dir: 'coverage'
            }
        },

        bower:
        {
            default:
            {
                rjsConfig: 'app/config.js'
            }
        },

        mocha:
        {
            options:
            {
                bail: false,
                log: true,
                run: false,
                reporter: process.env.TEAMCITY_PROJECT_NAME ? "mocha-teamcity-reporter" : "Spec",
                mocha:
                {
                    grep: grunt.option("grep")
                }
            },

            default:
            {
                src: [ "test/mocha.html" ],
                options: {
                    timeout: 60000,
                },
            },

            coverage:
            {
                src: [ "coverage/test/mocha.html" ],
            }
        },

        availabletasks: {
            tasks: {

                options: {
                    filter: "include",
                    tasks: ["build", "debug", "components", "compass", "copy", "test", "watch"]
                }
            }
        },

        http_upload: {

            publicFileViewer: {
                options: {
                  url: "https://api.rollbar.com/api/1/sourcemap",
                  method: "POST",
                  data: {
                    access_token: "d9da7f12d9d540b587053271608193b9",
                    version: currentDate,
                    minified_url: "http://home.trainingpeaks.com/CMSPages/GetResource.ashx?scriptfile=%2fCMSScripts%2fCustom%2fMarsWebApp%2fpublicFileViewer.js"
                  },
                },
                src: "build/components/js/publicFileViewer.js.map",
                dest: "source_map"
            }
        },

        'string-replace': {

            publicFileViewer: {
                files: { 
                    "build/components/js/publicFileViewer.js" : "build/components/js/publicFileViewer.js"
                },
                options: {
                    replacements: [
                        {
                            pattern: "{BUILD_VERSION}",
                            replacement: currentDate 
                        }
                    ]
                }                    
            }
        }


    });

    /*
    * With the new version of Grunt (>= 0.4) we need to install all the
    * "default" tasks manually using NPM and then need to include tem as
    * npm-tasks like this:
    */
    grunt.loadTasks("grunt/tasks");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-istanbul");
    grunt.loadNpmTasks("grunt-webfont");
    grunt.loadNpmTasks("grunt-targethtml");
    grunt.loadNpmTasks("grunt-bower-requirejs");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-available-tasks");
    grunt.loadNpmTasks("grunt-http-upload");
    grunt.loadNpmTasks("grunt-string-replace");

    grunt.registerTask("tpcore", ["uglify:tpcore", "uglify:tpcore.deps"]);

    // TESTING:
    grunt.registerTask("test", ["clean:coverage", "jshint", "tpcore", "setup-spec-list", "mocha:default"]);

    // REPORTING:
    // grunt coverage makes coverage reports available at localhost:8905/coverage/lcov-report/index.html,
    grunt.registerTask('coverage', ['clean:coverage', 'setup-spec-list', 'copy:pre_instrument', 'instrument', 'copy:post_instrument', 'mocha:coverage', 'storeCoverage', 'makeReport']);

    // BUILDING:

    // grunt debug does only compass and copy
    grunt.registerTask("default", ["debug"]);
    grunt.registerTask("debug", ["clean:debug", "compass:debug", "copy:debug", "uglify:tpcore", "uglify:tpcore.deps"]);

    // grunt build builds a single minified js for dev/uat/live, at build/release
    // grunt build_debug does the same but doesn't minify, and points to local dev config
    grunt.registerTask("build_common", ["clean", "jshint", "uglify:tpcore", "uglify:tpcore.deps", "coverage", "requirejs", "compass:build", "copy:build_common", "copy:build_coverage"]);
    grunt.registerTask("build_debug", ["build_common", "copy:build_debug", "targethtml:build_debug"]);
    grunt.registerTask("build_debug_fast", ["clean", "uglify:tpcore", "uglify:tpcore.deps", "requirejs", "compass:build", "copy:build_common", "copy:build_coverage", "copy:build_debug", "targethtml:build_debug"]);
    grunt.registerTask("build_debug_min", ["build_debug_fast", "targethtml:build_debug_min", "uglify"]);
    grunt.registerTask("build", ["build_common", "copy:build", "uglify:build", "clean:post_build", "targethtml:build", "revision"]);

    // to build external components
    grunt.registerTask("components:debug", ["clean:components", "copy:components", "compass:debug", "compass:components_debug", "requirejs:components", "string-replace:components"]);
    grunt.registerTask("components", ["clean", "jshint", "debug", "copy:components", "compass:components", "requirejs:components", "string-replace:components", "uglify:components"]);

    // list any individual external components here to be included in the build_components task
    grunt.registerTask("requirejs:components", ["requirejs:applyTrainingPlan", "requirejs:publicFileViewer"]);
    grunt.registerTask("string-replace:components", ["string-replace:publicFileViewer"]);

    // to build public file viewer upload source maps to rollbar
    grunt.registerTask("publicFileViewer:release", ["components", "http_upload:publicFileViewer"]);

    // help
    grunt.registerTask("help", ["availabletasks"]);

};
