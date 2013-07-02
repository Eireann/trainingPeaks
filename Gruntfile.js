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
            debug:
            {
                files:
                {
                    'build/debug/plato': ['app/**/!(Handlebars).js']
                }
            },
            dev:
            {
                files:
                {
                    'build/dev/plato': ['app/**/!(Handlebars).js']
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
            dev:
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/dev/app/css",
                    outputStyle: "expanded",
                    require: "zurb-foundation",
                    imagesDir: "assets/images"
                }
            },
            "uat":
            {
                options:
                {
                    sassDir: "app/scss",
                    cssDir: "build/uat/app/css",
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
            },

            dev:
            {
                src:
                [
                    "build/debug/single.js"
                ],

                dest: "build/dev/single.js",

                separator: ";"
            }
        },

        /*
         * The minification task uses the uglify library.
         */
        uglify:
        {
            uat:
            {
                files:
                {
                    "build/uat/single.min.js":
                    [
                        "build/debug/single.js"
                    ]
                }
            },
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
            dev:
            {
                src: ["build"]
            },
            "uat":
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
            },
            "uat":
            {
                src: "index.html",
                dest: "build/uat/index.html"
            },
            dev:
            {
                src: "index.html",
                dest: "build/dev/index.html"
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

            uat:
            {
                files:
                {
                    "build/uat": ["web.config", "assets/fonts/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
                }
            },

            dev:
            {
                files:
                {
                    "build/dev": ["web.config", "assets/fonts/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
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
            },
            
            dev_coverage:
            {
                files:
                {
                    "build/dev": ["coverage/lcov-report/**"]
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

    // NOTE: grunt test --dir=some/pattern will limit tests to a subfolder
    grunt.registerTask("test", ["clean:coverage", "jshint", "setup-spec-list", "jasmine_node"]);

    grunt.registerTask("update_grunt_config", ["requirejs_config", "i18n_config"]);
    grunt.registerTask("single", ["update_grunt_config", "requirejs", "concat:dist"]);
    grunt.registerTask("debug_single", ["clean", "single", "compass:debug", "targethtml:debug", "copy:debug"]);
    grunt.registerTask("debug", ["coverage", "single", "compass:debug", "targethtml:debug", "copy:debug", "copy:debug_coverage", "plato:debug"]);
    grunt.registerTask("dev", ["debug", "concat:dev", "compass:dev", "targethtml:dev", "copy:dev", "copy:dev_coverage", "plato:dev"]);
    grunt.registerTask("uat", ["clean", "single", "compass:uat", "targethtml:uat", "copy:uat", "uglify"]);
    grunt.registerTask("release", ["clean", "single", "compass:release", "targethtml:release", "copy:release", "uglify"]);
    grunt.registerTask("default", ["debug"]);

    // makes reports available at localhost/Mars/coverage/lcov-report/index.html,
    // and at build/debug/coverage/lcov-report/index.html
    grunt.registerTask('coverage', ['clean:coverage', 'copy:pre_instrument', 'instrument', 'copy:post_instrument', 'jasmine_node_coverage_config', 'jasmine_node', 'storeCoverage', 'makeReport']);

    // grunt debug && grunt coverage && grunt plato
    // for some reason putting debug and coverage into the same task results in some

};
