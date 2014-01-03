define(
[
    "utilities/units/labels",
], function(
    getUnitsLabel
) {

    /*
        options:
            unitsName,
            workoutTypeId
    */
    return function(options)
    {
        return getUnitsLabel(options.unitsName, options.workoutTypeId, null, options);
    };

});