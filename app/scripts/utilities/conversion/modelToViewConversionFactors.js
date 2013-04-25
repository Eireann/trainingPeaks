define(
[
    "utilities/units/constants"
],
function(unitsConstants)
{

    // Conversion factors from Model units (metric) to view units.
    // Use inverse (1/*) for View to Model conversion.
    var conversionFactors = {
        "distance":
        {
            English: 0.000621371,
            Metric: 0.001
        },
        "pace":
        {
            English: 26.8224,
            Metric: 16.666666666667
        },
        "speed":
        {
            English: 2.236936,
            Metric: 3.6
        },
        "elevation":
        {
            English: 3.28084,
            Metric: 1
        }
    };

    var lookupConversion = function(unitsType, userUnits)
    {
        var userUnitsKey = userUnits === unitsConstants.English ? "English" : "Metric";
        return conversionFactors[unitsType][userUnitsKey];
    };

    return lookupConversion;
});