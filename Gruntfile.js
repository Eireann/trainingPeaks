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

        /*
        sass:
        {
            dist:
            {
                "dist/debug/index.css":
                {
                    src: "app/styles/index.css",
                    paths: ["app/styles"],
                    prefix: "app/styles/",
                    additional: []
                }
            }
        },
        */

        requirejs:
        {
            compile:
            {
                options:
                {
                    mainConfigFile: "app/config.js",
                    jamConfig: "vendor/jam/require.config.js",
                    out: "dist/debug/single.js",
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
                    "dist/debug/single.js"
                ],

                dest: "dist/debug/single.js",

                separator: ";"
            }
        },

        mincss:
        {
            "dist/release/index.css":
            [
                "dist/debug/index.css"
            ]
        },

        /*
         * The minification task uses the uglify library.
         */
        uglify:
        {
            "dist/release/single.min.js":
            [
                "dist/debug/single.js"
            ]
        },

        server:
        {
            // Ensure the favicon is mapped correctly.
            files: { "favicon.ico": "favicon.ico" },

            prefix: "app/styles/",

            debug:
            {
                files: "<config:server.files>",

                folders:
                {
                    "app": "dist/debug",
                    "vendor/js/libs": "dist/debug",
                    "app/styles": "dist/debug"
                }
            },

            release:
            {
                host: "0.0.0.0",

                files: "<config:server.files>",

                folders:
                {
                    "app": "dist/release",
                    "vendor/js/libs": "dist/release",
                    "app/styles": "dist/release"
                }
            }
        },

        jasmine:
        {
            all: ["test/jasmine/*.html"]
        },

        watch:
        {
            files: ["Gruntfile.js", "vendor/**/*", "app/**/*"],
            tasks: "styles"
        },

        clean:
        [
            "dist/"
        ],

        // If you want to generate targeted `index.html` builds into the `dist/`
        // folders, uncomment the following configuration block and use the
        // conditionals inside `index.html`.
        //targethtml: {
        //  debug: {
        //    src: "index.html",
        //    dest: "dist/debug/index.html"
        //  },
        //
        //  release: {
        //    src: "index.html",
        //    dest: "dist/release/index.html"
        //  }
        //},

        // This task will copy assets into your build directory,
        // automatically.  This makes an entirely encapsulated build into
        // each directory.
        //copy: {
        //  debug: {
        //    files: {
        //      "dist/debug/app/": "app/**",
        //      "dist/debug/vendor/": "vendor/**"
        //    }
        //  },

        //  release: {
        //    files: {
        //      "dist/release/app/": "app/**",
        //      "dist/release/vendor/": "vendor/**"
        //    }
        //  }
        //}
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
    grunt.loadNpmTasks("grunt-contrib-mincss");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    
    grunt.registerTask("debug", [ "clean", "requirejs", "concat" ]);
    grunt.registerTask("release", [ "debug", "uglify" ]);

};
