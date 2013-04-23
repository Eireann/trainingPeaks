define(
[
    "utilities/printKeyStat",
    "utilities/printKeyStatUnits",
    "utilities/printUnitLabel",
    "utilities/printUnitsValue"

], function (printKeyStat, printKeyStatUnits, printUnitLabel, printUnitsValue)
{
    return {
        printKeyStat: printKeyStat,
        printKeyStatUnits: printKeyStatUnits,
        printUnitLabel: printUnitLabel,
        printUnitsValue: printUnitsValue
    };
});