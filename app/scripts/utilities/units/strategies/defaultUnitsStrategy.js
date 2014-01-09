define(
[
    "underscore",
    "backbone",
    "backbone.marionette",
    "utilities/units/labels"
], function(
    _,
    Backbone,
    Marionette,
    getUnitsLabel
) {


    /*
        options:
            limiter = function that limits a number to a min/max value
            converter = function that converts a value from one unit to another
            formatter = function that formats a value for display
            parser = function that parses string input to number
            labeler = function that returns a label

            workoutTypeId,
            userUnits
    */
    function DefaultUnitsStrategy(options) {
        this._validateOptions(options);
        this.options = options;

        this.limiter = options.limiter;
        this.converter = options.converter;
        this.formatter = options.formatter;
        this.labeler = options.labeler;

        this.emptyValidator = options.emptyValidator;

        this.parser = options.parser || null;
    }

    DefaultUnitsStrategy.extend = Backbone.Marionette.extend;

    _.extend(DefaultUnitsStrategy.prototype, {

        formatValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!this.emptyValidator(value))
            {
                return this._getDefaultValueForFormat();
            }           

            // convert to user/view units
            var convertedValue = this.converter.convertToViewUnits(value, this.options);

            // limit if necessary
            var limitedValue = this.limiter(convertedValue, this.options);

            // format it
            var output = this.formatter(limitedValue, this.options);

            // add a units label
            if(this.options.withLabel)
            {
                output += " " + this.labeler(this.options);
            }

            return output;
        },

        parseValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!this.emptyValidator(value))
            {
                return this._getDefaultValueForParse();
            }

            // parse if necessary - i.e. for duration/pace or other formatted strings
            if(this.parser)
            {
                value = this.parser(value, this.options);
            }

            // limit if necessary
            var limitedValue = this.limiter(value, this.options);

            // convert to model units
            var convertedValue = this.converter.convertToModelUnits(limitedValue, this.options);

            return convertedValue;
        },

        getLabel: function()
        {
            return this.labeler(this.options);
        },

        getLabelShort: function()
        {
            return this.labeler(_.defaults({abbreviated: true}, this.options));
        },

        getLabelLong: function()
        {
            return this.labeler(_.defaults({abbreviated: false}, this.options));
        },

        _getDefaultValueForFormat: function()
        {
            return _.has(this.options, "defaultValue") ? this.options.defaultValue : "";
        },

        _getDefaultValueForParse: function()
        {
            return _.has(this.options, "defaultValue") ? this.options.defaultValue : null;
        },

        _validateOptions: function(options)
        {
            _.each(["emptyValidator", "limiter", "converter", "formatter", "labeler", "workoutTypeId", "userUnits"], function(param)
            {
                if(!_.has(options, param))
                {
                    throw new Error(param + " is required for DefaultUnitsStrategy");
                }
            });
        }
    });

    return DefaultUnitsStrategy;

});