define(
[
    "underscore",
    "utilities/units/constants",
    "utilities/workout/workoutTypes"
],
function(_, unitsConstants, workoutTypeUtils)
{
    // Conversion factors from Model units (metric) to view units.
    // Use inverse (1/*) for View to Model conversion.
    var conversionFactors = {

        meters:
        {
            miles: 0.000621371,
            kilometers: 0.001,
            yards: 1.0936133
        },

        "pace":
        {
            // yards per second
            English: 2.236936 / 60,

            // meters per second
            Metric: 3.6 / 60,

            Swim:
            {
                // convert meters per second to yards per 100 seconds, as a minute value
                English: (1.0936133 / 100) * 60,

                // meters per second to meters per 100 seconds, as a minute value
                Metric: (1 / 100) * 60
            },

            Rowing:
            {
                English: (1 / 100) * 60,
                Metric: (1 / 100) * 60
            }
        },
        "speed":
        {
            English: 2.236936,
            Metric: 3.6,

            Swim:
            {
                // convert meters per second to yards per / minute
                English: 1.0936133 * 60,

                // meters per second to meters per minute
                Metric: 60
            },
            Rowing:
            {
                English:60,
                Metric:60
            }

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
        },
        "cm":
        {
            English: 0.393701,
            Metric: 1
        },
        "kg":
        {
            English: 2.20462,
            Metric: 1
        },
        "ml":
        {
            English: 0.033814,
            Metric: 1
        }
    };

    var getUnitsFactorBySportTypeOrDefault = function(unitsType, sportTypeName, userUnitsKey)
    {
        var conversionFactorsForUnits = conversionFactors[unitsType];
        var conversionFactor = conversionFactorsForUnits[userUnitsKey];

        if (sportTypeName && conversionFactorsForUnits.hasOwnProperty(sportTypeName) && conversionFactorsForUnits[sportTypeName].hasOwnProperty(userUnitsKey))
        {
            conversionFactor = conversionFactorsForUnits[sportTypeName][userUnitsKey];
        }

        if(_.isString(conversionFactor))
        {
            conversionFactor = lookupUnitsConversionFactor(conversionFactorsForUnits.baseUnits, conversionFactor);
        }

        return conversionFactor;
    };

    var lookupUserUnitsFactor = function(unitsType, userUnits, sportTypeId)
    {
        var userUnitsKey = userUnits === unitsConstants.English ? "English" : "Metric";

        var sportTypeName = null;
        if (sportTypeId)
        {
            sportTypeName = workoutTypeUtils.getNameById(sportTypeId);
        }

        if (!conversionFactors.hasOwnProperty(unitsType))
            throw new Error("Unknown units type (" + unitsType + ") for unit conversion");

        return getUnitsFactorBySportTypeOrDefault(unitsType, sportTypeName, userUnitsKey);

    };

    var lookupUnitsConversionFactor = function(baseUnits, conversionUnits)
    {
        if(baseUnits === conversionUnits)
        {
            return 1;
        }
        else
        {
            if(!_.has(conversionFactors, baseUnits) || !_.has(conversionFactors[baseUnits], conversionUnits))
            {
                throw new Error("Invalid conversion factors (" + baseUnits + ", " + conversionUnits + ")");
            }
            return conversionFactors[baseUnits][conversionUnits];
        }
    };

    return {
        lookupUserUnitsFactor: lookupUserUnitsFactor,
        lookupUnitsConversionFactor: lookupUnitsConversionFactor,
        conversionFactors: conversionFactors
    };
});
