module.exports = function(grunt)
{
    var _ = require('underscore');

    // CONFIG FOR JASMINE WITH COVERAGE
    grunt.registerTask("jasmine_node_coverage_config", "Configure for jasmine node with coverage", function()
    {
        var jasmineOptions = grunt.config.get('jasmine_node');
        jasmineOptions.projectRoot = "./coverage";
        jasmineOptions.requirejs = './coverage/app/config/jasmineRequirejsConfig.js';
        jasmineOptions.teamcity = false;
        grunt.config.set('jasmine_node', jasmineOptions);
    });

};
