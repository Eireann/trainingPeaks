module.exports = function(grunt)
{
    var _ = require('underscore');

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


};

