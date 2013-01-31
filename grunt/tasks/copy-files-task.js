module.exports = function (grunt) {
    'use strict';

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

};

