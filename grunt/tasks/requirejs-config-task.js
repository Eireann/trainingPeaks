module.exports = function(grunt)
{

    var _ = require('underscore');
    var fs = require('fs');

    // CONFIG FOR REQUIREJS
    grunt.registerTask("requirejs_config", "Configure for requirejs build", function()
    {
        // common requirejs settings
        var gruntRequirejsSettings = require("../../app/config/commonRequirejsConfig");
        var requireJsOptions = grunt.config.get('requirejs');
        _.extend(requireJsOptions.build.options, gruntRequirejsSettings);

        // bring in affiliate settings
        var affiliateFolders = fs.readdirSync("app/scripts/affiliates");
        _.each(affiliateFolders, function(affiliateCode)
        {
            requireJsOptions.build.options.include.push("affiliates/" + affiliateCode + "/settings");
        });

        // update main config
        grunt.config.set('requirejs', requireJsOptions);
    });

};

