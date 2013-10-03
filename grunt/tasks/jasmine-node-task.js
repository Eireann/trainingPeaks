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
        readCommonJasmineOptions(options);
        readSpecMatcherOptions(options);
        addCompleteCallback(options, this.async(), util);
        detectTeamcity(options, _);

        // what are we testing?
        console.log("testing specs in folder: " + options.specFolders.join() + ", matching pattern " + options.regExpSpec);

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
    function findSpecFolder(specsFolder)
    {
        var dirOption = grunt.option("dir");

        if(dirOption)
        {
            var pattern = new RegExp(dirOption, "i");
            var matchedFolder = findFolder(pattern, specsFolder);
            if(matchedFolder)
            {
                return matchedFolder;
            }
        }

        return specsFolder;
    }

    function findFolder(pattern, folder)
    {

        // top level directory matches
        if (fs.statSync(folder).isDirectory() && folder.match(pattern))
        {
            return folder;

        // sub directory matches
        } else if (fs.statSync(folder).isDirectory())
        {
            var files = fs.readdirSync(folder);
            for (var i = 0; i < files.length; i++)
            {
                var path = folder + "/" + files[i];
                if (fs.statSync(path).isDirectory())
                {
                    var matchingSubfolder = findFolder(pattern, path);
                    if(matchingSubfolder)
                        return matchingSubfolder;
                }
            }
        }

        // no match in this tree
        return null;
    }

    function readCommonJasmineOptions(options)
    {

        options.useRequireJs = grunt.config("jasmine_node.requirejs") || false;
        options.isVerbose = grunt.config("jasmine_node.verbose") || true;
        options.showColors = grunt.config("jasmine_node.colors") || true;
        options.junitreport = grunt.config("jasmine_node.jUnit") || {
                report: false,
                savePath: "./reports/",
                useDotNotation: true,
                consolidate: true
            };

    }

    function readSpecMatcherOptions(options)
    {

        // what folders to look in
        var specFolder = findSpecFolder(grunt.config("jasmine_node.specFolder"));
        options.specFolders = [specFolder];

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

