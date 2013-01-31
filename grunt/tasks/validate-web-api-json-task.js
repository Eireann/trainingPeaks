module.exports = function (grunt) {
    'use strict';

    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');
    var requirejs = require('requirejs');

    // Validate that each Web API Model has default values matching the server-generated JSON
    grunt.registerMultiTask('validate-webapi-models', 'Validate default values of Web API Models', function()
    {

        // setup requirejs
        var basePath = path.join(__dirname, "../..");
        var appPath = path.join(basePath, "app");
        var commonConfig = require(path.join(appPath, "config/commonRequirejsConfig"));
        var nodeConfig = require(path.join(appPath, "config/nodeRequirejsConfig"));
        requirejs.config(commonConfig);
        requirejs.config(nodeConfig);
        requirejs.config({ baseUrl: appPath });
        requirejs.config({ deps: ["browserEnvironment"] });

        // mark as async so we can load modules via requirejs
        var onDone = this.async();

        var registeredModels = {};

        function waitFor(modelName)
        {
            //grunt.log.writeln("Waiting for " + modelName);
            registeredModels[modelName] = true;
        }

        function finished(modelName)
        {
            //grunt.log.writeln("Finished " + modelName);
            delete registeredModels[modelName];
            if (_.keys(registeredModels).length === 0)
            {
                onDone(true);
            }
        }

        function compareValues(modelPath, defaultValues, expectedValues)
        {

            var success = true;

            function fail(msg)
            {
                grunt.log.fail(modelPath + " failed: " + msg);
                success = false;
                onDone(false);
            }

            // is everything in expected in defaults?
            _.each(_.keys(expectedValues), function(key)
            {
                if (!defaultValues.hasOwnProperty(key))
                {
                    fail("Key " + key + " is in server model JSON but not model defaults");
                }

                if (expectedValues[key] !== defaultValues[key])
                {
                    fail("Model default value '" + defaultValues[key] + "' for key " + key + " does not match server model value '" + expectedValues[key] + "'");
                }
            });

            // is everything in defaults in expected?
            _.each(_.keys(defaultValues), function(key)
            {
                if (!expectedValues.hasOwnProperty(key))
                {
                    fail("Key " + key + " is in model defaults but not server model JSON ");
                }

                if (expectedValues[key] !== defaultValues[key])
                {
                    fail("Model default value '" + defaultValues[key] + "' for key " + key + " does not match server model value '" + expectedValues[key] + "'");
                }
            });

            return success;
        }

        _.each(this.files, function(file)
        {
            _.each(file.src, function(srcFile)
            {
                var modelPath = "models/" + path.basename(srcFile, '.js');
                waitFor(modelPath);
                requirejs(
                    [modelPath],
                    function(ModelConstructor)
                    {
                        if (_.isFunction(ModelConstructor) && ModelConstructor.prototype.hasOwnProperty('webAPIModelName'))
                        {
                            var webAPIModelName = ModelConstructor.prototype.webAPIModelName;
                            var defaultValues = ModelConstructor.prototype.defaults;
                            var webAPIJsonFile = path.join(basePath, "test/webApiJson/" + webAPIModelName + ".json");
                            if (fs.existsSync(webAPIJsonFile))
                            {
                                var expectedValues = JSON.parse(fs.readFileSync(webAPIJsonFile));
                                if (compareValues(modelPath, defaultValues, expectedValues))
                                {
                                    grunt.log.success(modelPath + " passed");
                                }
                            } else
                            {
                                grunt.log.writeln("No JSON file defined for " + webAPIModelName + " (" + webAPIJsonFile + "), skipping validations");
                            }
                        }
                        finished(modelPath);
                    }
                );
            });

        });

    });

};

