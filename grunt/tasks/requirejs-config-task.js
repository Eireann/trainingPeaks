module.exports = function(grunt)
{

    var _ = require('underscore');

    // CONFIG FOR REQUIREJS
    grunt.registerTask("requirejs_config", "Configure for requirejs build", function()
    {
        var gruntRequirejsSettings = require("../../app/config/commonRequirejsConfig");
        var requireJsOptions = grunt.config.get('requirejs');
        _.extend(requireJsOptions.compile.options, gruntRequirejsSettings);
        grunt.config.set('requirejs', requireJsOptions);
    });

};

