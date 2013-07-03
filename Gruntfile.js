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
            release:
            {
                files:
                {
                    'build/release/plato': ['app/**/!(Handlebars).js']
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
            release:
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
            compile:
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
            release:
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
                    "build/debug/single.js"
                ],

                dest: "build/debug/single.js",

                separator: ";"
            }

        },

        /*
         * The minification task uses the uglify library.
         */
        uglify:
        {
            release:
            {
                files:
                {
                    "build/release/single.min.js":
                    [
                        "build/debug/single.js"
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
                src: ["build"]
            },
            release:
            {
                src: ["build"]
            },
            coverage:
            {
                src: ["coverage"]
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

            release:
            {
                files:
                {
                    "build/release": ["web.config", "assets/fonts/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
                }
            },

            pre_instrument:
            {
                files:
                {
                    "coverage": ["test/**", "vendor/**", "app/**"]
                }
            },

            post_instrument:
            {
                files:
                {
                    "coverage": ["app/Handlebars.js", "app/config/**"]
                }
            },

            release_coverage:
            {
                files:
                {
                    "build/release": ["coverage/lcov-report/**"]
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
          files: "app/**/!(Handlebars).js",
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

    // grunt release builds a single minified js for dev/uat/live
    grunt.registerTask("release", ["clean", "coverage", "requirejs_config", "i18n_config", "requirejs", "concat:release", "uglify:release", "compass:release", "copy:release", "targethtml:release", "copy:release_coverage", "plato:release"]);

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
