define(
[
    "utilities/convertTimeHoursToDecimal",
    "utilities/convertToModelUnits",
    "utilities/convertToViewUnits"
], function (convertTimeHoursToDecimal, convertToModelUnits, convertToViewUnits)
{
    return {
        convertTimeHoursToDecimal: convertTimeHoursToDecimal,
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits
    };
});