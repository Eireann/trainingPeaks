define(
[
    "utilities/conversion/convertTimeHoursToDecimal",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits"
], function (convertTimeHoursToDecimal, convertToModelUnits, convertToViewUnits)
{
    return {
        convertTimeHoursToDecimal: convertTimeHoursToDecimal,
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits
    };
});