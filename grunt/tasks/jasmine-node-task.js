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

        var projectRoot = grunt.config("jasmine_node.projectRoot") || ".";
        var specFolder = findSpecFolder(grunt.config("jasmine_node.specFolder"));

        console.log("testing specs in folder: " + specFolder);

        var source = grunt.config("jasmine_node.source") || "src";
        var specNameMatcher = grunt.config("jasmine_node.specNameMatcher") || "spec";
        var teamcity = process.env.TEAMCITY_PROJECT_NAME || grunt.config("jasmine_node.teamcity") || false;
        if (grunt.config("jasmine_node").hasOwnProperty("teamcity"))
        {
            teamcity = grunt.config("jasmine_node.teamcity");
        }

        var useRequireJs = grunt.config("jasmine_node.requirejs") || false;
        var extensions = grunt.config("jasmine_node.extensions") || "js";
        var match = grunt.config("jasmine_node.match") || ".";
        var matchall = grunt.config("jasmine_node.matchall") || false;
        var autotest = grunt.config("jasmine_node.autotest") || false;
        var useHelpers = grunt.config("jasmine_node.useHelpers") || false;
        var forceExit = grunt.config("jasmine_node.forceExit") || false;

        var isVerbose = grunt.config("jasmine_node.verbose");
        var showColors = grunt.config("jasmine_node.colors");

        if (_.isUndefined(isVerbose)) {
            isVerbose = true;
        }

        if (_.isUndefined(showColors)) {
            showColors = true;
        }

        var junitreport = {
            report: false,
            savePath: "./reports/",
            useDotNotation: true,
            consolidate: true
        };

        var jUnit = grunt.config("jasmine_node.jUnit") || junitreport;

        // Tell grunt this task is asynchronous.
        var done = this.async();

        var regExpSpec = new RegExp(match + (matchall ? "" : specNameMatcher + "\\.") + "(" + extensions + ")$", 'i');
        var onComplete = function (runner, log) {
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

        var options = {
            specFolder: specFolder,
            onComplete: onComplete,
            isVerbose: isVerbose,
            showColors: showColors,
            teamcity: teamcity,
            useRequireJs: useRequireJs,
            regExpSpec: regExpSpec,
            junitreport: jUnit
        };

        // teamcity?
        /*
        if (options.teamcity) {
            console.log("Using teamcity reporting");
            var jasmineNode = require('../../node_modules/jasmine-node/lib/jasmine-node/reporter').jasmineNode;
            jasmineNode.TerminalReporter = jasmine.TeamcityReporter;
        }
        */

        // order is preserved in node.js
        var legacyArguments = Object.keys(options).map(function (key) {
            return options[key];
        });

        try {
            // since jasmine-node@1.0.28 an options object need to be passed
            jasmine.executeSpecsInFolder(options);
        } catch (e)
        {
            console.log('Failed to execute "jasmine.executeSpecsInFolder": ' + e.stack);
        }
    });

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
};

