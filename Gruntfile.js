var _ = require("underscore");
var path = require("path");
var fs = require("fs");

module.exports = function(grunt)
{

    grunt.loadTasks("grunt/tasks");

    grunt.initConfig(
    {
        jshint:
        {
            all:
            [
                "Gruntfile.js",
                "test/specs/**/*.js",
                "app/*.js",
                "app/scripts/**/*.js",
                "!app/Handlebars.js",
                "app/templates/**/*.json"
            ],
            options:
            {
                scripturl: true,
                curly: false,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                devel: true,
                sub: true,
                globals:
                {
                    "apiConfig": true,
                    "theMarsApp": true,
                    "$": true
                }
            }
        },

        plato:
        {
            dummy:
            {
                files:
                {
                    'plato': ['app/**/!(Handlebars).js']
                }
            },
            build:
            {
                files:
                {
                    'build/debug/plato': ['app/**/!(Handlebars).js']
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
            }
        },

        requirejs:
        {
            build:
            {
                options:
                {
                    baseUrl: "app",
                    out: "build/debug/single.js",
                    name: "main",
                    include: ["Backbone.Marionette.Handlebars"],
                    exclude: ["hbs", "Handlebars"],
                    wrap: false,
                    optimize: "none"
                }
            }
        },

        concat:
        {
            build:
            {
                src:
                [
                    // We include AlmondJS + the compiled unified app.js file.
                    "vendor/js/libs/almond.js",
                    "vendor/js/libs/lodash.TP.js",
                    "vendor/js/libs/underscore.amd.js",
                    "vendor/js/libs/HandlebarsRuntime.js",
                    "vendor/js/libs/flot/jquery.flot.js",
                    "vendor/js/libs/flot/jquery.flot.crosshair.js",
                    "vendor/js/libs/flot/jquery.flot.resize.js",
                    "vendor/js/libs/packery/packery.pkgd.js",
                    "build/debug/single.js"
                ],

                dest: "build/release/single.js",

                separator: ";"
            }
        },

        targethtml:
        {
            build:
            {
                src: "index.html",
                dest: "build/release/index.html"
            },
            build_debug:
            {
                src: "index.html",
                dest: "build/release/index.html"
            }
        },
        /*
         * The minification task uses the uglify library.
         */
        uglify:
        {
            build:
            {
                files:
                {
                    "build/release/single.min.js":
                    [
                        "build/release/single.js"
                    ]
                }
            }
        },

        watch:
        {
            compass: {
                files: ["Gruntfile.js", "app/scss/**/*.scss"],
                tasks: "compass:debug"
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
            }
        },

        deleteFiles:
        {
            build:
            {
                files:
                {
                    "build/release": ["build/release/**/single.js", "build/debug/**/single.js"]
                }
            }
        },

        copy:
        {
            debug:
            {
                files:
                {
                    "build/debug": ["assets/fonts/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
                }
            },

            build_common:
            {
                files:
                {
                    "build/release": ["assets/fonts/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
                }
            },

            build_debug:
            {
                files:
                {
                    "build/release": ["apiConfig.dev.js"]
                }
            },

            build:
            {
                files:
                {
                    "build/release": ["apiConfig.js", "web.config"]
                }
            },

            // stuff that needs to get instrumented for test coverage to work
            pre_instrument:
            {
                files:
                {
                    "coverage": ["test/**", "app/**"]
                }
            },

            // stuff that needs to be clean and not modified by test coverage instrumentation
            post_instrument:
            {
                files:
                {
                    "coverage": ["vendor/**", "app/Handlebars.js", "app/config/**", "apiConfig.js"]
                }
            },

            build_coverage:
            {
                files:
                {
                    "build/debug": ["coverage/lcov-report/**"]
                }
            }
        },

        // jasmine testsuites
        jasmine_node:
        {
            specNameMatcher: ".spec",
            specFolder: "test",
            projectRoot: ".",
            requirejs: './app/config/jasmineRequirejsConfig.js',
            forceExit: true,
            watchfiles: ['app/**/*.js', 'test/specs/**/*.js', 'app/**/*.html'],
            jUnit: {
                report: false,
                savePath: "./junit_reports/",
                useDotNotation: false,
                consolidate: true
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
        }

    });

    /*
    * With the new version of Grunt (>= 0.4) we need to install all the
    * "default" tasks manually using NPM and then need to include tem as
    * npm-tasks like this:
    */
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-istanbul");

    
    // TESTING:
    // NOTE: grunt test --dir=some/pattern will limit tests to a subfolder
    grunt.registerTask("test", ["clean:coverage", "jshint", "setup-spec-list", "jasmine_node"]);
    grunt.registerTask("unit_test", ["unit_test_config", "clean:coverage", "jshint", "jasmine_node"]);
    grunt.registerTask("bdd_test", ["bdd_test_config", "clean:coverage", "jshint", "jasmine_node"]);

    // REPORTING:
    // grunt plato:dummy makes complexity reports available at localhost:8905/plato
    // grunt coverage makes coverage reports available at localhost:8905/coverage/lcov-report/index.html,
    grunt.registerTask('coverage', ['clean:coverage', 'copy:pre_instrument', 'instrument', 'copy:post_instrument', 'jasmine_node_coverage_config', 'jasmine_node', 'storeCoverage', 'makeReport']);

    // BUILDING:

    // grunt debug does only compass and copy
    grunt.registerTask("default", ["debug"]);
    grunt.registerTask("debug", ["clean:debug", "compass:debug", "copy:debug"]);

    // grunt build builds a single minified js for dev/uat/live, at build/release
    // grunt build_debug does the same but doesn't minify, and points to local dev config
    grunt.registerTask("build_common", ["clean", "coverage", "requirejs_config", "i18n_config", "requirejs", "concat", "compass:build", "copy:build_common", "copy:build_coverage", "plato:build"]);
    grunt.registerTask("build_debug", ["build_common", "copy:build_debug", "targethtml:build_debug", "copy-i18n-files"]);
    grunt.registerTask("build_debug_fast", ["clean", "requirejs_config", "requirejs", "concat", "compass:build", "copy:build_common", "copy:build_coverage", "copy:build_debug", "targethtml:build_debug"]);
    grunt.registerTask("build", ["build_common", "copy:build", "uglify", "deleteFiles:build", "targethtml:build", "copy-i18n-files"]);

    // TASKS THAT ARE USED BY OTHER TASKS
    grunt.registerTask("bdd_test_config", "Configure for jasmine node bdd tests", function()
    {
        var jasmineOptions = grunt.config.get('jasmine_node');
        jasmineOptions.specFolder = "test/specs/bdd_tests";
        grunt.config.set('jasmine_node', jasmineOptions);
    });

    grunt.registerTask("unit_test_config", "Configure for jasmine node unit tests", function()
    {
        var jasmineOptions = grunt.config.get('jasmine_node');
        jasmineOptions.specFolder = "test/specs/unit_tests";
        grunt.config.set('jasmine_node', jasmineOptions);
    });

};
