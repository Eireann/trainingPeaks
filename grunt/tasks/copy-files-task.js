module.exports = function(grunt)
{

    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');

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
                
            });
        });
    });

};

