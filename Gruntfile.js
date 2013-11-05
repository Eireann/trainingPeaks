var _ = require("underscore");
var path = require("path");
var fs = require("fs");

module.exports = function(grunt)
{
    grunt.initConfig(
    {
        locales: ["en_us", "fr_fr", "it_it"],

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
                expr: true, // Allow  chai syntax. TODO: Move to test only jshint
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
            }
        },

        requirejs:
        {
            build:
            {
                options:
                {
                    baseUrl: "app",
                    out: "build/release/single.js",
                    name: "main",
                    include: [
                        "../vendor/js/libs/almond",
                        "../vendor/js/libs/HandlebarsRuntime",
                        "../vendor/js/libs/flot/jquery.flot",
                        "../vendor/js/libs/flot/jquery.flot.crosshair",
                        "../vendor/js/libs/flot/jquery.flot.resize",
                        "Backbone.Marionette.Handlebars",
                        "testUtils/testHelpers"
                    ],
                    excludeShallow: ["hbs", "Handlebars"],
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
                files:
                {
                    "build/release/single.min.js":
                    [
                        "build/release/single.js"
                    ]
                }
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
                    "build/debug": [ "favicon.ico", "vendor/js/libs/leaflet/*.css", "vendor/js/libs/leaflet/images/*", "assets/fonts/**", "assets/icons/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
                }
            },

            build_common:
            {
                files:
                {
                    "build/release": [ "favicon.ico", "vendor/js/libs/leaflet/*.css", "vendor/js/libs/leaflet/images/*", "assets/fonts/**", "assets/icons/**", "assets/images/**", "app/scripts/affiliates/**", "!app/scripts/affiliates/**/*.js"]
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
                    "build/release": ["web.config"]
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
                    "coverage": ["bower_components/**", "vendor/**", "app/Handlebars.js", "app/config/**", "apiConfig.dev.js"]
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

        lodash:
        {
            tp:
            {
                options:
                {
                    modifier: 'underscore',
                    exports: ['amd', 'commonjs', 'global', 'node'],
                    plus: ['merge'],
                    flags: ['debug']
                },
                dest: 'vendor/js/libs/lodash.TP.js'
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
                reporter: process.env.TEAMCITY_PROJECT_NAME ? "Teamcity" : "Spec",
                mocha:
                {
                    grep: grunt.option("grep")
                }
            },

            default:
            {
                src: [ "test/mocha.html" ],
            },

            coverage:
            {
                src: [ "coverage/test/mocha.html" ],
            }
        }

    });

    /*
    * With the new version of Grunt (>= 0.4) we need to install all the
    * "default" tasks manually using NPM and then need to include tem as
    * npm-tasks like this:
    */
    grunt.loadTasks("grunt/tasks");
    grunt.loadTasks("grunt/uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-istanbul");
    grunt.loadNpmTasks("grunt-webfont");
    grunt.loadNpmTasks("grunt-lodash");
    grunt.loadNpmTasks("grunt-targethtml");
    grunt.loadNpmTasks("grunt-bower-requirejs");
    grunt.loadNpmTasks("grunt-mocha");


    // TESTING:
    // NOTE: grunt test --dir=some/pattern will limit tests to a subfolder
    grunt.registerTask("test", ["clean:coverage", "jshint", "setup-spec-list", "mocha:default"]);

    // REPORTING:
    // grunt plato:dummy makes complexity reports available at localhost:8905/plato
    // grunt coverage makes coverage reports available at localhost:8905/coverage/lcov-report/index.html,
    grunt.registerTask('coverage', ['clean:coverage', 'copy:pre_instrument', 'instrument', 'copy:post_instrument', 'mocha:coverage', 'storeCoverage', 'makeReport']);

    // BUILDING:

    // grunt debug does only compass and copy
    grunt.registerTask("default", ["debug"]);
    grunt.registerTask("debug", ["clean:debug", "compass:debug", "copy:debug"]);

    // grunt build builds a single minified js for dev/uat/live, at build/release
    // grunt build_debug does the same but doesn't minify, and points to local dev config
    // removed "plato:build" as last step of build_common
    grunt.registerTask("build_common", ["clean", "jshint", "coverage", "requirejs_config", "i18n_config", "requirejs", "compass:build", "copy:build_common", "copy:build_coverage"]);
    grunt.registerTask("build_debug", ["build_common", "copy:build_debug", "targethtml:build_debug", "copy-i18n-files"]);
    grunt.registerTask("build_debug_fast", ["clean", "requirejs_config", "requirejs", "compass:build", "copy:build_common", "copy:build_coverage", "copy:build_debug", "targethtml:build_debug"]);
    grunt.registerTask("build_debug_min", ["build_debug_fast", "targethtml:build_debug_min", "uglify"]);
    grunt.registerTask("build", ["add-defaults-to-i18n-files", "build_common", "copy:build", "uglify", "deleteFiles:build", "targethtml:build", "copy-i18n-files", "revision"]);
};
