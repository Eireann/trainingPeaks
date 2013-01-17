var _ = require("underscore");

module.exports = function (grunt) {

    grunt.initConfig(
    {

        jshint:
        {
            all: ["Gruntfile.js", "app/*.js", "app/scripts/**/*.js", "!app/Handlebars.js"],
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
            files: ["Gruntfile.js", "app/scss/*.scss"],
            tasks: "compass"
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

    // jasmine testsuites
    jasmine_node: {
        specNameMatcher: ".spec",
        projectRoot: ".",
        requirejs: './test/jasmine_requirejs_config.js',
        forceExit: true,
        watchfiles: ['app/**/*.js', 'test/specs/**/*.js', 'app/**/*.html']
    }

});

/*
* With the new version of Grunt (>= 0.4) we need to install all the
* "default" tasks manually using NPM and then need to include tem as
* npm-tasks like this:
*/
grunt.loadNpmTasks("grunt-contrib-clean");
grunt.loadNpmTasks("grunt-contrib-compass");
//grunt.loadNpmTasks("grunt-contrib-copy");
grunt.loadNpmTasks("grunt-contrib-jshint");
grunt.loadNpmTasks("grunt-contrib-concat");
grunt.loadNpmTasks("grunt-contrib-uglify");
grunt.loadNpmTasks("grunt-contrib-requirejs");
grunt.loadNpmTasks("grunt-contrib-watch");
//grunt.loadNpmTasks("grunt-targethtml");
grunt.loadNpmTasks('grunt-jasmine-node');


grunt.registerTask("i18n_config", "Compile one single.js file for each supported language", function () {

    // modify properties of the requirejs grunt config
    function addLocaleToRequirejs(localeName, localeSingleFile) {

        // get the requirejs config so we can modify it 
        var requireJsOptions = grunt.config.get('requirejs');

        // clone the default 'compile' options
        var localeOptions = _.clone(requireJsOptions.compile.options);

        // add locale specific details
        localeOptions.out = localeSingleFile;
        localeOptions.locale = localeName;

        // add it into the requirejs options
        requireJsOptions[localeName] = { options: localeOptions };

        // update grunt config with the new values
        grunt.config.set('requirejs', requireJsOptions);

    }

    // modify properties of concat grunt config
    function addLocaleToConcat(localeName, localeSingleFile) {
        // get the concat config so we can modify it 
        var concatOptions = grunt.config.get('concat');

        // clone the default 'dist' options
        var localeOptions = _.clone(concatOptions.dist);

        // add locale specific details
        localeOptions.dest = localeSingleFile;
        localeOptions.src = _.clone(concatOptions.dist.src);
        localeOptions.src[1] = localeSingleFile;

        // add it into the requirejs options
        concatOptions[localeName] = localeOptions;

        // update grunt config with the new values
        grunt.config.set('concat', concatOptions);
    }

    // modify properties of uglify grunt config
    function addLocaleToUglify(localeName, localeSingleFile) {
        var uglifyOptions = grunt.config.get('uglify');
        var localeOptions = _.clone(uglifyOptions.release);
        var minFile = localeSingleFile.replace("debug", "release").replace(".js", ".min.js");
        localeOptions.files = {};
        localeOptions.files[minFile] = [localeSingleFile];
        uglifyOptions[localeName] = localeOptions;
        grunt.config.set('uglify', uglifyOptions);
    }

    // this needs to be in a config file
    var locales = ["en_us", "fr_fr", "it_it"];

    // build options for each locale - set the single.js filename and the locale
    _.each(locales, function (localeName) {
        var localeSingleFile = "build/debug/single_" + localeName + ".js";
        addLocaleToRequirejs(localeName, localeSingleFile);
        addLocaleToConcat(localeName, localeSingleFile);
        addLocaleToUglify(localeName, localeSingleFile);
    });

});

grunt.registerTask("i18n", ["i18n_config", "debug", "compass:release", "concat"]);
grunt.registerTask("test", ["jshint", "jasmine_node"]);
grunt.registerTask("debug", ["clean", "requirejs", "compass:debug", "concat"]);
//@TODO copy:debug - grunt.registerTask("debug", ["clean", "requirejs", "compass:debug", "concat", "copy:debug"]);
grunt.registerTask("release", ["clean", "requirejs", "compass:release", "concat", "uglify", "copy:release", "test"]);
grunt.registerTask("default", ["debug", "test"]);

/* DISABLED TESTACULAR
//"testacular": "~0.5.6"
// testacular test runner - failing on hbs template imports, gives cryptic error messages
grunt.registerTask("testacular", "Run Jasmine Tests", function () {
var done = this.async();
require("child_process").exec("testacular start testacular.conf.js --single-run", function (err, stdout) {
grunt.log.write(stdout);
done(err);
});

});
*/

};
