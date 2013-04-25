define(
[
    "utilities/units/labels",
    "utilities/units/constants"
], function(getUnitsLabel, constants)
{
    return {
        // TP.utils.units.getUnitsLabel(fieldName, sportType, viewContext)
        getUnitsLabel: getUnitsLabel,

        constants: constants
    };
});