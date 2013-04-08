define(
[
    "utilities/printDate",
    "utilities/printKeyStat",
    "utilities/printKeyStatUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/printUnitLabel",
    "utilities/printUnitsValue"

], function (printDate, printKeyStat, printKeyStatUnits, printTimeFromDecimalHours, printUnitLabel, printUnitsValue)
{
    return {
        printDate: printDate,
        printKeyStat: printKeyStat,
        printKeyStatUnits: printKeyStatUnits,
        printTimeFromDecimalHours: printTimeFromDecimalHours,
        printUnitLabel: printUnitLabel,
        printUnitsValue: printUnitsValue
    };
});