module.exports = function(grunt)
{
    grunt.initConfig(
    {
        jshint:
        {
            all: [ "Gruntfile.js", "app/*.js", "app/scripts/**/*.js" ],
            options:
            {
                scripturl: true,
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true
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
                    mainConfigFile: "app/config.js",
                    jamConfig: "vendor/jam/require.config.js",
                    out: "build/debug/single.js",
                    name: "config",
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
            "build/release/single.min.js":
            [
                "build/debug/single.js"
            ]
        },
        
        watch:
        {
            files: ["Gruntfile.js", "app/scss/*.scss"],
            tasks: "compass"
        },

        clean:
        [
            "build/"
        ],

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
                  "build/debug/app/images/": "app/images/**",
                  "build/debug/vendor/": "vendor/**"
                }
            },

            release:
            {
                files:
                {
                    "build/release/app/images/": "app/images/**",
                    "build/release/vendor/": "vendor/**"
                }
            }
        },
        
        testacularServer:
        {
            unit:
            {
                configFile: "test/testacular.conf.js"
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
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-testacular");
    //TODO BROKEN BUT NEEDED: grunt.loadNpmTasks("grunt-targethtml");

    grunt.registerTask("test", "Run Jasmine Tests", function()
    {

    });
    
    grunt.registerTask("debug", [ "clean", "requirejs", "compass:debug", "concat", "copy:debug" ]);
    grunt.registerTask("release", [ "clean", "requirejs", "compass:release", "concat", "uglify", "copy:release" ]);
    grunt.registerTask("default", "debug");
};
