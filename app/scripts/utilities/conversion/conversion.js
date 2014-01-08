define(
[
    "underscore",
    "moment",
    "utilities/units/unitsStrategyFactory"
], function(
            _,
            moment,
            UnitsStrategyFactory
            )
{
    var conversion = {

        /*
            options:
                defaultValue
                workoutTypeId
                withLabel
        */
        formatUnitsValue: function(units, value, options)
        {
            var unitsStrategy = conversion._buildStrategyForUnits(units, options);
            return unitsStrategy.formatValue(value);
        },

        /*
            options:
                defaultValue
                workoutTypeId
        */
        parseUnitsValue: function(units, value, options)
        {
            var unitsStrategy = conversion._buildStrategyForUnits(units, options);
            return unitsStrategy.parseValue(value);
        },

        // keep this
        toPercent: function(numerator, denominator)
        {
            return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
        },

        _buildStrategyForUnits: function(units, options)
        {
            var strategyOptions = _.defaults({}, options, {workoutTypeId: conversion._getMySportType(options)});
            return UnitsStrategyFactory.buildStrategyForUnits(units, strategyOptions);
        },

        _getMySportType: function(options)
        {
            var sportType = null;
            if (options && options.hasOwnProperty("workoutTypeValueId"))
            {
                sportType = options.workoutTypeValueId;
            } else if (options && options.hasOwnProperty("workoutTypeId"))
            {
                sportType = options.workoutTypeId;
            } else if (options && options.hasOwnProperty("model") && options.model.has("workoutTypeValueId"))
            {
                sportType = options.model.get("workoutTypeValueId");
            } else if (this.hasOwnProperty("model") && this.model.has("workoutTypeValueId"))
            {
                sportType = this.model.get("workoutTypeValueId");
            }
            return sportType;
        }
    };

    return conversion;

});
