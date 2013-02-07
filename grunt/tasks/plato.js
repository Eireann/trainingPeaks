/*
 * copied and modified from grunt-plato
 */

'use strict';

module.exports = function(grunt) {

    var plato = require('plato');
    var _ = require("underscore");

    grunt.registerMultiTask('plato', 'Generate static analysis charts with plato', function()
    {

        // default options
        var options = this.options({
            jshint: {},
            complexity: {}
        });

        //inherit from grunt jshint config
        if (options.jshint && !options.jshint.options)
        {
            var jshintOptions = grunt.config.get('jshint');
            options.jshint = {
                options: jshintOptions.options,
                globals: jshintOptions.options.globals
            };
            delete options.jshint.options.globals;
        }

        // wait for plato to do it's thing
        var done = this.async();
        plato.inspect(this.filesSrc, this.files[0].dest, options, function()
        {
            done();
        });

    });

};
