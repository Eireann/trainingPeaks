define(
[
    "utilities/printDate",
    "utilities/printKeyStat",
    "utilities/printKeyStatUnits",
    "utilities/printUnitLabel",
    "utilities/printUnitsValue"

], function (printDate, printKeyStat, printKeyStatUnits, printUnitLabel, printUnitsValue)
{
    return {
        printDate: printDate,
        printKeyStat: printKeyStat,
        printKeyStatUnits: printKeyStatUnits,
        printUnitLabel: printUnitLabel,
        printUnitsValue: printUnitsValue
    };
});