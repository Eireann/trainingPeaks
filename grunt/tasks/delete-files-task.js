module.exports = function(grunt)
{

    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');

    // FILE COPYING - a highly simplified version grunt-contrib-copy
    grunt.registerMultiTask('deleteFiles', 'Delete files.', function()
    {
        _.each(this.files, function(file)
        {

            var destFolder = path.normalize(file.dest);

            _.each(file.src, function(srcFile)
            {
                var srcPath = path.normalize(srcFile);

                if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile())
                {
                    //grunt.log.writeln("Copy " + srcPath + " to " + destPath);
                    fs.unlinkSync(srcPath);
                    //fs.createReadStream(srcPath).pipe(fs.createWriteStream(destPath));
                }
            });
        });
    });

};

