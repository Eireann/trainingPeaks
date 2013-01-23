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
                devel: true
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
    //grunt.loadNpmTasks('grunt-jasmine-node');

    // CONFIG FOR REQUIREJS
    grunt.registerTask("requirejs_config", "Configure for requirejs build", function()
    {
        var gruntRequirejsSettings = require("./app/config/grunt_requirejs_config");
        var requireJsOptions = grunt.config.get('requirejs');
        _.extend(requireJsOptions.compile.options, gruntRequirejsSettings);
        grunt.config.set('requirejs', requireJsOptions);
        //console.log(grunt.config.get('requirejs').compile.options.shim); 
    });

    // INTERNATIONALIZATION
    grunt.registerTask("i18n_config", "Compile one single.js file for each supported language", function()
    {

        // modify properties of the requirejs grunt config

        function addLocaleToRequirejs(localeName, localeSingleFile)
        {

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

        function addLocaleToConcat(localeName, localeSingleFile)
        {
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

        function addLocaleToUglify(localeName, localeSingleFile)
        {
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
        _.each(locales, function(localeName)
        {
            var localeSingleFile = "build/debug/locale/" + localeName + "/single.js";
            addLocaleToRequirejs(localeName, localeSingleFile);
            addLocaleToConcat(localeName, localeSingleFile);
            addLocaleToUglify(localeName, localeSingleFile);
        });

    });
    // END INTERNATIONALIZATION

    // FILE COPYING - a highly simplified version grunt-contrib-copy
    grunt.registerMultiTask('copy', 'Copy files.', function()
    {
        var copyFileSync = function(srcFile, destFile)
        {
            var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
            BUF_LENGTH = 64 * 1024;
            buff = new Buffer(BUF_LENGTH);
            fdr = fs.openSync(srcFile, 'r');
            fdw = fs.openSync(destFile, 'w');
            bytesRead = 1;
            pos = 0;
            while (bytesRead > 0)
            {
                bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
                fs.writeSync(fdw, buff, 0, bytesRead);
                pos += bytesRead;
            }
            fs.closeSync(fdr);
            return fs.closeSync(fdw);
        };
        _.each(this.files, function(file)
        {

            var destFolder = path.normalize(file.dest);

            _.each(file.src, function(srcFile)
            {
                var srcPath = path.normalize(srcFile);
                var destPath = path.join(destFolder, srcFile);
                // mkdir
                if (fs.statSync(srcPath).isDirectory() && !fs.existsSync(destPath))
                {

                    //console.log("mkdir: " + destPath);
                    var pathParts = destPath.split(path.sep);
                    var dir = "";
                    while (pathParts.length > 0)
                    {
                        dir = path.join(dir, pathParts.shift());
                        grunt.log.writeln("Mkdir " + dir);
                        if (!fs.existsSync(dir))
                        {
                            fs.mkdirSync(dir);
                        }
                    }
                    // copy
                }
                else if (fs.statSync(srcPath).isFile())
                {
                    grunt.log.writeln("Copy " + srcPath + " to " + destPath);
                    copyFileSync(srcPath, destPath);
                    //fs.createReadStream(srcPath).pipe(fs.createWriteStream(destPath));
                }
            });
        });
    });
    // END COPY FILES

    // TARGETHTML - copied and modified from grunt-targethtml
    grunt.registerMultiTask('targethtml', 'Produces html-output depending on grunt release version', function()
    {
        // The source files to be processed. The "nonull" option is used
        // to retain invalid files/patterns so they can be warned about.

        //var files = grunt.file.expand({ nonull: true }, this.file.srcRaw);

        // Warn if a source file/pattern was invalid.
        var invalidSrc = this.files.some(function(filepath)
        {
            if (!grunt.file.exists(filepath))
            {
                grunt.log.error('Source file "' + filepath + '" not found.');
                return true;
            }
        });
        
        if (invalidSrc)
        {
            return false;
        }

        // Process files
        var target = this.target;
        _.each(this.files, function(file)
        {
            var dest = file.dest;
            var src = file.src[0];
            var contents = grunt.file.read(src);
            console.log("SRC: " + src);
            console.log("DEST: " + dest);
            console.log("TARGET: " + target);
            if (contents)
            {
                contents = contents.replace(new RegExp('<!--[\\[\\(]if target ' + target + '[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->', 'g'), '$2');
                contents = contents.replace(new RegExp('^[\\s\\t]+<!--[\\[\\(]if target .*?[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->[\r\n]*', 'gm'), '');
                contents = contents.replace(new RegExp('<!--[\\[\\(]if target .*?[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->[\r\n]*', 'g'), '');
                grunt.file.write(dest, contents);
            }

            // Otherwise, print a success message.
            grunt.log.ok('File "' + dest + '" created.');
        });
    });
    // END TARGETHTML

    grunt.registerTask("test", ["jshint", "jasmine_node"]);
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