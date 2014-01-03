define(
[
    "utilities/workout/workoutTypes",
    "utilities/units/constants",
    "utilities/conversion/modelToViewConversionFactors"
], function(
    workoutTypeUtils,
    unitsConstants,
    modelToViewConversionFactors
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

    function _lookupLabelsFromOptions(options)
    {
        if(!options || !options.labels)
        {
            return null;
        }

        var labels = options.labels;
        var userUnitsKey = options.userUnits === unitsConstants.English ? "English" : "Metric";
        var unitsLabels = labels[userUnitsKey];

        var sportTypeName = options.workoutTypeId ? workoutTypeUtils.getNameById(options.workoutTypeId) : null;
        if (sportTypeName && labels.hasOwnProperty(sportTypeName) && labels[sportTypeName].hasOwnProperty(userUnitsKey))
        {
            unitsLabels = labels[sportTypeName][userUnitsKey];
        }

        return unitsLabels;
    }

    function _lookupLabels(options)
    {

        var unitsLabels = _lookupLabelsFromOptions(options);

        if(!unitsLabels)
        {
            var unitsName = _lookupUserUnitName(options);
            unitsLabels = modelToViewConversionFactors.lookupUnitsLabels(unitsName);
        }

        return unitsLabels;
    }

    /*
        options:
            unitsName,
            workoutTypeId
    */
    return function(options)
    {
        var labels = _lookupLabels(options);

        if (options && options.abbreviated === false)
        {
            return labels.unabbreviated;
        }
        else
        {
            return labels.abbreviated;
        }
    };

});