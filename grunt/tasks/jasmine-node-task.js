/*
Copied and modified from grunt-jasmine-node/tasks
the teamcity and junit settings weren't quite right

Also, in jasmine-node/lib/jasmine-node/index.js, it uses jasmineNode.TerminalReporter instead of jasmine.TeamcityReporter, not sure why,
so replaced one with the other here. problem solved ...
*/

require('jasmine-node');

module.exports = function(grunt)
{

    var fs = require('fs');
    var Path = require('path');

    // command line options grunt jasmine_node --dir=pattern --spec=pattern
    grunt.registerTask("jasmine_node", "Runs jasmine-node.", function () {


        var util;
        // TODO: ditch this when grunt v0.4 is released
        grunt.util = grunt.util || grunt.utils;
        var _ = grunt.util._;

        try {
            util = require('util');
        } catch (e) {
            util = require('sys');
        }


        var options = {};
        // pass through anything we don't care about specifically
        var options = _.clone(grunt.config("jasmine_node"));
        addDefaultOptions(options, _);
        readSpecMatcherOptions(options);
        addCompleteCallback(options, this.async(), util);
        detectTeamcity(options, _);

        if(!options.teamcity)
        {
            addProgressReporter(options, _);
        }



        // what are we testing?
        console.log("testing specs in folder: " + options.specFolders.join(",") + ", matching pattern " + options.regExpSpec);

        try {
            // since jasmine-node@1.0.28 an options object need to be passed
            jasmine.executeSpecsInFolder(options);
        } catch (e)
        {
            console.log('Failed to execute "jasmine.executeSpecsInFolder": ' + e.stack);
        }
    });

    function detectTeamcity(options, _)
    {
        // get teamcity from environment variable, or set manually with config flag
        var teamcity = process.env.TEAMCITY_PROJECT_NAME || grunt.config("jasmine_node.teamcity") || false;
        if (grunt.config("jasmine_node").hasOwnProperty("teamcity"))
        {
            teamcity = grunt.config("jasmine_node.teamcity");
        }
        if(teamcity)
        {
            options.teamcity = true;
            var jasmineEnv = jasmine.getEnv();

            // dummy reporter exists just to call our onComplete function, because TeamCity reporter doesn't do it
            var DummyReporter = function() {};
            _.extend(DummyReporter.prototype, {
                reportRunnerResults: function(runner){ options.onComplete(runner); },
                reportRunnerStarting: function(runner) { },
                reportSpecResults: function(spec) { },
                reportSpecStarting: function(spec) { },
                reportSuiteResults: function(suite) {}
            });

            jasmineEnv.addReporter(new DummyReporter());
        }
    }

    function addProgressReporter(options, _)
    {
        var jasmineEnv = jasmine.getEnv();

        // progress reporter gives us some ongoing status so we can be more entertained while waiting for specs to run 
        // it also groups log lines under the appropriate test suite name
        var ProgressReporter = function() {
            this.currentSuite = null;
        };
        _.extend(ProgressReporter.prototype, {
            reportRunnerResults: function(runner){ },
            reportRunnerStarting: function(runner) { },
            reportSpecResults: function(spec) { 
                if(!spec.results().passed())
                {
                    console.log(spec.getFullName() + " Failed:");
                    console.log("    " + spec.results().getItems().join("\n    "));
                }
            },
            reportSpecStarting: function(spec) { 
                // don't log every single suite/spec as the console gets too cluttered and slow. just log when starting a new top level suite
                var suiteName = spec.suite.getFullName();
                if(!this.currentSuite || suiteName.indexOf(this.currentSuite) !== 0)
                {
                    this.currentSuite = suiteName;
                    this.log(spec.suite.getFullName() + "...");
                }
            },
            reportSuiteResults: function(suite) {},
            log: function(str) {
                console.log(str);
            }
        });

        jasmineEnv.addReporter(new ProgressReporter());
    }

    function addCompleteCallback(options, done, util)
    {

        var forceExit = grunt.config("jasmine_node.forceExit") || false;
        options.onComplete = function (runner, log) {
            var exitCode;
            util.print('\n');
            if (runner.results().failedCount === 0) {
                exitCode = 0;
            } else {
                exitCode = 1;
                if (forceExit) {
                    process.exit(exitCode);
                }
            }

            done();
        };
    }

    // match command line folder option
    function findSpecFolders(specFolderMatcher, rootFolder)
    {

        var pattern = new RegExp(specFolderMatcher, "i");
        var matchedFolders = findFolders(pattern, rootFolder);
        if(matchedFolders)
        {
            return matchedFolders;
        }

        // default if our find fails
        return [specFolderMatcher];
    }

    function findFolders(pattern, folder)
    {

        var folders = [];

        // only look at directories
        if (fs.statSync(folder).isDirectory())
        {

            // if top level folder matches, push it and return
            if(pattern.test(folder))
            {
                folders.push(folder);
                return folders;
            }

            // else check subdirectories
            var files = fs.readdirSync(folder);
            for (var i = 0; i < files.length; i++)
            {
                var subFolderPath = folder + "/" + files[i];
                if (fs.statSync(subFolderPath).isDirectory())
                {
                    var matchingChildFolders = findFolders(pattern, subFolderPath);
                    if(matchingChildFolders)
                    {
                        for(var j = 0;j<matchingChildFolders.length;j++)
                        {
                            folders.push(matchingChildFolders[j]);
                        }
                    }
                }
            }
        }

        // no match in this tree
        return folders.length ? folders : null;
    }

    function addDefaultOptions(options, _)
    {
        _.defaults(options, {
            isVerbose: true,
            showColors: true
        });
    }

    function readSpecMatcherOptions(options)
    {

        // what folders to look in
        var specFolderMatcher = grunt.option("dir") || grunt.config("jasmine_node.specFolder");
        var rootFolder = grunt.config("jasmine_node.specFolder");
        options.specFolders = findSpecFolders(specFolderMatcher, rootFolder);

        // what file names to match
        var specNameMatcher = grunt.option("spec") || grunt.config("jasmine_node.specNameMatcher") || null;
        if(specNameMatcher)
        {
            specNameMatcher = ".*" + specNameMatcher.replace("^","").replace("$","") + ".*";
        }

        var extensions = grunt.config("jasmine_node.extensions") || "js";

        options.regExpSpec = new RegExp((specNameMatcher ? specNameMatcher : ".*") + "\\." + "(" + extensions + ")$", 'i');
    }

};

