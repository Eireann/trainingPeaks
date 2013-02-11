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
                "!app/Handlebars.js"
            ],
            options:
            {
                scripturl: true,
                curly: false,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                devel: true,
                globals:
                {
                    "theMarsApp": true
                }
            }
        },

        plato: {
            dummy: {
                files: {
                    'plato': ['app/**/!(Handlebars).js']
                }
            },
            debug: {
                files: {
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
            dist:
            {
                src:
                [
                    // We include AlmondJS + the compiled unified app.js file.
                    "vendor/js/libs/almond.js",
                    "vendor/js/libs/lodash/lodash.amd.js",
                    "vendor/js/libs/HandlebarsRuntime.js",
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
                files: ["Gruntfile.js", "app/scss/*.scss"],
                tasks: "compass"
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
        
        targethtml:
        {
            debug:
            {
                src: "index.html",
                dest: "build/debug/index.html"
            },
            release:
            {
                src: "index.html",
                dest: "build/release/index.html"
            }
        },

        copy:
        {
            debug:
            {
                files:
                {
                    "build/debug": ["assets/images/**"]
                }
            },

            release:
            {
                files:
                {
                    "build/release": ["assets/images/**"]
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

            debug_coverage:
            {
                files:
                {
                    "build/debug": ["coverage/lcov-report/**"]
                }
            }
        },

        "validate-webapi-models":
        {
            compile:
            {
                files:
                {
                    "app/script/models": ["app/scripts/models/**/*.js"]
                }
            }
        },

        // jasmine testsuites
        jasmine_node:
        {
            specNameMatcher: ".spec",
            projectRoot: ".",
            requirejs: './app/config/jasmine_requirejs_config.js',
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
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-istanbul");

    grunt.registerTask("test", ["clean:coverage", "jshint", "validate_models", "jasmine_node"]);
    grunt.registerTask("validate_models", ["validate-webapi-models"]);
    grunt.registerTask("update_grunt_config", ["requirejs_config", "i18n_config"]);
    //grunt.registerTask("debug", ["clean", "coverage", "update_grunt_config", "requirejs", "compass:debug", "targethtml:debug", "concat", "copy:debug", 'copy:debug_coverage', "plato"]);
    grunt.registerTask("debug", ["clean", "update_grunt_config", "requirejs", "compass:debug", "targethtml:debug", "concat", "copy:debug", 'copy:debug_coverage']);

    grunt.registerTask("release", ["debug", "compass:release", "targethtml:release", "uglify", "copy:release"]);
    grunt.registerTask("default", ["debug"]);

    // makes reports available at localhost/Mars/coverage/lcov-report/index.html,
    // and at build/debug/coverage/lcov-report/index.html
    grunt.registerTask('coverage', ['clean:coverage', 'copy:pre_instrument', 'instrument', 'copy:post_instrument', 'jasmine_node_coverage_config', 'jasmine_node', 'storeCoverage', 'makeReport']);

    // grunt debug && grunt coverage && grunt plato
    // for some reason putting debug and coverage into the same task results in some

};
