define(
[
    "utilities/workout/workoutTypes",
    "utilities/units/constants",
    "utilities/conversion/unitConversionFactors",
], function(
    workoutTypeUtils,
    unitsConstants,
    unitConversionFactors
) {

    /*
        options:
            workoutTypeId, 
            userUnits,
            units
    */
    return {

        convertToViewUnits: function(value, options)
        {
            return +value * this._lookupConversionFactor(options);
        },

        convertToModelUnits: function(value, options)
        {
            return +value / this._lookupConversionFactor(options);
        },

        _lookupConversionFactor: function(options)
        {

            if(!options || !options.units)
            {
                return 1;
            }

            var baseUnits = options.units.baseUnits;
            var userUnits = this._lookupUserUnitName(options);
            return unitConversionFactors.lookupUnitsConversionFactor(baseUnits, userUnits);
        },

        _lookupUserUnitName: function(options)
        {
            var units = options.units;
            var userUnitsKey = options.userUnits === unitsConstants.English ? "English" : "Metric";
            var unitsName = units[userUnitsKey];

            var sportTypeName = options.workoutTypeId ? workoutTypeUtils.getNameById(options.workoutTypeId) : null;
            if (sportTypeName && units.hasOwnProperty(sportTypeName) && units[sportTypeName].hasOwnProperty(userUnitsKey))
            {
                unitsName = units[sportTypeName][userUnitsKey];
            }

            return unitsName;
        }

    };

});