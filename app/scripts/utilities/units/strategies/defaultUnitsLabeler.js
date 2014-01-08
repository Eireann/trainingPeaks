define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/units/constants",
    "utilities/conversion/unitConversionFactors"
], function(
    _,
    workoutTypeUtils,
    unitsConstants,
    unitConversionFactors
) {

    // TODO: this is duplicated in defaultUnitsConverter
    function _lookupUserUnitName(options)
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

    function _lookupLabels(options)
    {

        var unitsName = _lookupUserUnitName(options);
        return unitConversionFactors.lookupUnitsLabels(unitsName);
    }

    /*
        options:
            unitsName,
            workoutTypeId
    */
    return function(options)
    {
        var label = _lookupLabels(options);

        if(_.has(label, "abbreviated"))
        {
            if (options && options.abbreviated === false)
            {
                return label.unabbreviated;
            }
            else
            {
                return label.abbreviated;
            }
        }
        else
        {
            return label;
        }

    };

});