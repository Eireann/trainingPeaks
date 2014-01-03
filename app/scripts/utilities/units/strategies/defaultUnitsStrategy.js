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
            labeler = function that returns a label

            workoutTypeId,
            userUnits,
            unitsName
    */
    function DefaultUnitsStrategy(options) {
        this._validateOptions(options);
        this.options = options;

        this._limiter = options.limiter;
        this._converter = options.converter;
        this._formatter = options.formatter;
        this._labeler = options.labeler;
    }

    _.extend(DefaultUnitsStrategy.prototype, {

        extend: Backbone.Marionette.extend,

        formatValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!this._hasValue(value))
            {
                return this._getDefaultValueForFormat();
            }           

            // convert to user/view units
            var convertedValue = this._converter.convertToViewUnits(value, this.options);

            // limit if necessary
            var limitedValue = this._limiter(convertedValue, this.options);

            // format it
            var output = this._formatter(limitedValue, this.options);

            // add a units label
            if(this.options.withLabel)
            {
                output += " " + this._labeler(this.options);
            }

            return output;
        },


        parseValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!this._hasValue(value))
            {
                return this._getDefaultValueForParse();
            }

            // limit if necessary
            var limitedValue = this._limiter(value, this.options);

            // convert to model units
            var convertedValue = this._converter.convertToModelUnits(limitedValue, this.options);

            return convertedValue;
        },

        getLabel: function()
        {
            return this._labeler(this.options);
        },

        getLabelShort: function()
        {
            return this._labeler(_.defaults({abbreviated: true}, this.options));
        },

        getLabelLong: function()
        {
            return this._labeler(_.defaults({abbreviated: false}, this.options));
        },

        _hasValue: function(value)
        {
            return !(this._valueIsEmpty(value) || this._valueIsNotANumber(value) || !_.isFinite(value));
        },

        _valueIsEmpty: function(value)
        {
            return _.isUndefined(value) || _.isNull(value) || ("" + value).trim() === "" || (Number(value) === 0 && !this._valueIsZero(value));
        },

        _valueIsNotANumber: function(value)
        {
            return _.isNaN(value) || _.isNaN(Number(value)) || _.isUndefined(value) || _.isNull(value);
        },

        _valueIsZero: function(value)
        {
            return value === 0 || value === "0" || /^0+.?0*$/.test(value);
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
            _.each(["limiter", "converter", "formatter", "labeler", "workoutTypeId", "userUnits", "unitsName"], function(param)
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