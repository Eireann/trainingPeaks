define(
[
    "utilities/units/constants",
    "utilities/workout/workoutTypes"
],
function(unitsConstants, workoutTypeUtils)
{
    // Conversion factors from Model units (metric) to view units.
    // Use inverse (1/*) for View to Model conversion.
    var conversionFactors =
    {
        "distance":
        {
            English: 0.000621371,
            Metric: 0.001,

            Swim:
            {
                English: 1.0936133,
                Metric: 1
            }
        },
        "pace":
        {
            English: 2.236936 / 60,
            Metric: 3.6 / 60,

            Swim:
            {
                English: 100 / 1.0936133,
                Metric: 100 / 1
            }
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
        },
        "efficiencyfactor":
        {
            English: 60 * 1.09361,
            Metric: 60
        },
        "torque":
        {
            English: 8.850745793490558,
            Metric: 1
        }
    };

    var lookupConversion = function(unitsType, userUnits, sportTypeId)
    {
        var userUnitsKey = userUnits === unitsConstants.English ? "English" : "Metric";

        var sportTypeName = null;
        if (sportTypeId)
        {
            sportTypeName = workoutTypeUtils.getNameById(sportTypeId);
        }

        if (!conversionFactors.hasOwnProperty(unitsType))
            throw "Unknown units type (" + unitsType + ") for unit label";

        if (sportTypeName && conversionFactors[unitsType].hasOwnProperty(sportTypeName) && conversionFactors[unitsType][sportTypeName].hasOwnProperty(userUnitsKey))
            return conversionFactors[unitsType][sportTypeName][userUnitsKey];

        return conversionFactors[unitsType][userUnitsKey];
    };

    return lookupConversion;
});