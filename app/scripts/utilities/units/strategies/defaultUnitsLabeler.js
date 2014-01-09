define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/units/constants",
    "../unitConversionFactors"
], function(
    _,
    workoutTypeUtils,
    unitsConstants,
    unitConversionFactors
) {

    // TODO: this is duplicated in defaultUnitsConverter
    function _lookupUserUnitName(options)
    {
        var units = options.unitTypes;
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
        return unitConversionFactors.lookupUnitsLabel(unitsName);
    }

    /*
        options:
            unitsName,
            workoutTypeId
    */
    return function(options)
    {

        if(!options || !options.unitTypes)
        {
            return "";
        }

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