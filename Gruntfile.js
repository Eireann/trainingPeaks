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
                    imagesDir: "app/images"
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
                    imagesDir: "app/images"
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
                    "build/debug": ["app/images/**"]
                }
            },

            release:
            {
                files:
                {
                    "build/release": ["app/images/**"]
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
                report: true,
                savePath: "./junit_reports/",
                useDotNotation: false,
                consolidate: true
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

    grunt.registerTask("test", ["jshint", "validate_models", "jasmine_node"]);
    grunt.registerTask("validate_models", ["validate-webapi-models"]);
    grunt.registerTask("update_grunt_config", ["requirejs_config", "i18n_config"]);
    grunt.registerTask("debug", ["clean", "update_grunt_config", "requirejs", "compass:debug", "targethtml:debug", "concat", "copy:debug"]);
    grunt.registerTask("release", ["debug", "compass:release", "targethtml:release", "uglify", "copy:release"]);
    grunt.registerTask("default", ["debug"]);

    /* DISABLED TESTACULAR - doesn't run some of our async tests 
    //"testacular": "~0.5.6"
    grunt.registerTask("testacular", "Run Jasmine Tests", function () {
    var done = this.async();
    require("child_process").exec("testacular start testacular.conf.js --single-run", function (err, stdout) {
    grunt.log.write(stdout);
    done(err);
    });
    
    });
    */

};