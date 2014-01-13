define(
[
    "underscore",
    "../defaultUnitsConverter",
    "utilities/datetime/datetime"
], function(
    _,
    defaultUnitsConverter,
    datetimeUtils
) {

    /*
        options:
            workoutTypeId, 
            userUnits,
            units
    */
    return _.defaults({

        // converts hourse pace to meters per second
        convertToModelUnits: function(paceInHours, options)
        {
            // don't divide by zero
            if(paceInHours === 0)
            {
                return 0;
            }

            var conversionFactor = this._lookupConversionFactor(options);
            var speedInMetersPerSecond = 1 / (paceInHours * conversionFactor);

            return speedInMetersPerSecond;
        },

        // converts meters per second to hours
        convertToViewUnits: function(speedInMetersPerSecond, options)
        {

            // don't divide by zero
            if(speedInMetersPerSecond === 0)
            {
                return 0;
            }

            var conversionFactor = this._lookupConversionFactor(options);
            var paceInHours = 1 / (speedInMetersPerSecond * conversionFactor);

            return paceInHours;
        }

    }, defaultUnitsConverter);

});