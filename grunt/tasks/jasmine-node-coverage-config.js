module.exports = function(grunt)
{
    var _ = require('underscore');

    // CONFIG FOR JASMINE WITH COVERAGE
    grunt.registerTask("jasmine_node_coverage_config", "Configure for jasmine node with coverage", function()
    {
        var jasmineOptions = grunt.config.get('jasmine_node');
        jasmineOptions.projectRoot = "./coverage";
        jasmineOptions.specFolder = "coverage/test";
        jasmineOptions.requirejs = './coverage/app/config/jasmineRequirejsConfig.js';
        // is there a reason why we were turning this teamcity reporting off during coverage?
        jasmineOptions.teamcity = true;
        grunt.config.set('jasmine_node', jasmineOptions);
    });

};

