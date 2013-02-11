module.exports = function(grunt)
{
    'use strict';

    var _ = require('underscore');

    // CONFIG FOR JASMINE WITH COVERAGE
    grunt.registerTask("jasmine_node_coverage_config", "Configure for jasmine node with coverage", function()
    {
        var jasmineOptions = grunt.config.get('jasmine_node');
        jasmineOptions.projectRoot = "./coverage";
        jasmineOptions.requirejs = './coverage/app/config/jasmine_requirejs_config.js';
        grunt.config.set('jasmine_node', jasmineOptions);
    });

};

