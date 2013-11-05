module.exports = function(grunt)
{

    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');

    // FILE COPYING - a highly simplified version grunt-contrib-copy
    grunt.registerTask('setup-spec-list', 'Setup Spec List', function()
    {

        var specsFolder = "test/specs";
        var specListPath = "test/specs.js";

        function listSpecsInFolder(specsFolder, baseName)
        {
            var specs = [];
            var files = fs.readdirSync(specsFolder);
            _.each(files, function(file)
            {
                var filePath = path.join(specsFolder, file);
                if (fs.statSync(filePath).isDirectory())
                {
                    var subSpecs = listSpecsInFolder(filePath, path.join(baseName, file));
                    _.each(subSpecs, function(specName)
                    {
                        specs.push(specName);
                    });
                } else if(fs.statSync(filePath).isFile() && /\.spec\.js$/.test(file))
                {
                    specs.push(path.join(baseName, file));
                }
            });

            return specs;
        }

        var specs = listSpecsInFolder(specsFolder, "specs");
        var specList = "define([\n'";
        specList += specs.join("',\n'").replace(/\\/g, "/").replace(/\.js/g, '');
        specList += "'\n], function() {});";
        var outFile = fs.openSync(specListPath, "w");
        fs.writeSync(outFile, specList);
        fs.closeSync(outFile);

    });

};

