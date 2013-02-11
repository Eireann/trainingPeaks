module.exports = function (grunt) {

    var _ = require('underscore');
    var fs = require('fs');

    // this needs to be in a config file
    var locales = ["en_us", "fr_fr", "it_it"];

    function getLocalePath(target, localeName)
    {
        return "build/" + target + "/" + localeName;
    }

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

            // add locale specific single.js file
            localeOptions.dest = localeSingleFile;
            localeOptions.src = _.clone(concatOptions.dist.src);
            localeOptions.src[3] = localeSingleFile;

            // add the moment.js translation
            var momentLangDir = "vendor/js/libs/moment/lang/";
            var momentLocaleFile = momentLangDir + localeName.replace("_", "-") + ".js";
            var momentLangFile = momentLangDir + localeName.split("_")[0] + ".js";
            if (fs.existsSync(momentLocaleFile))
            {
                localeOptions.src.push("vendor/js/libs/moment/dotDotMoment.js");
                localeOptions.src.push(momentLocaleFile);
                //grunt.log.writeln("Adding " + momentLocaleFile);
            } else if (fs.existsSync(momentLangFile))
            {
                localeOptions.src.push("vendor/js/libs/moment/dotDotMoment.js");
                localeOptions.src.push(momentLangFile);
                //grunt.log.writeln("Adding " + momentLangFile);
            } else
            {
                //grunt.log.writeln("No language file found for moment.js: " + momentLangFile);
            }

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

        // build options for each locale - set the single.js filename and the locale
        _.each(locales, function(localeName)
        {
            var localeFolder = getLocalePath('debug', localeName);
            var localeSingleFile = localeFolder + "/single.js";
            addLocaleToRequirejs(localeName, localeSingleFile);
            addLocaleToConcat(localeName, localeSingleFile);
            addLocaleToUglify(localeName, localeSingleFile);
        });

        //console.log(grunt.config.get("compass"));
        //console.log(grunt.config.get("concat"));

    });

    // Copies css, assets, index.html files into locale folders
    grunt.registerTask("copy_i18n_files", "Copy i18n app files", function()
    {
        function copyFileSync(srcFile, destFile)
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

        var targets = ['debug', 'release'];
        var filesToCopy = ['app/css', 'assets', 'index.html'];
        // build options for each locale - set the single.js filename and the locale
        _.each(locales, function(localeName)
        {
            _.each(targets, function(targetName)
            {
                var localeFolder = getLocalePath(targetName, localeName);

                _.each(filesToCopy, function(fileName)
                {
                    var srcPath = "build/" + targetName + "/" + fileName;
                    var destPath = "build/" + targetName + "/" + localeName + "/" + fileName;
                });

            });

        });


    });
};

