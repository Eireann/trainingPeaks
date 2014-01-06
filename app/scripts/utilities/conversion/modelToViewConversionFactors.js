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
    var unitDefinitions = {

        miles:
        {
            label:
            {
                abbreviated: "mi",
                unabbreviated: "miles"
            }
        },

        kilometers:
        {
            label:
            {
                abbreviated: "km",
                unabbreviated: "kilometers"
            }
        },

        yards:
        {
            label:
            {
                abbreviated: "yds",
                unabbreviated: "yards"
            }
        },

        meters:
        {
            conversions:
            {
                miles: 0.000621371,
                kilometers: 0.001,
                yards: 1.0936133
            },

            label:
            {
                abbreviated: "m",
                unabbreviated: "meters"  
            }
        },

        metersPerSecond:
        {
            conversions:
            {
                mph: 2.236936,
                kph: 3.6,
                metersPerMinute: 60,
                yardsPerMinute: 1.0936133 * 60,
                secondsPerHundredYards: (1.0936133 / 100) * 60,
                secondsPerHundredMeters: (1 / 100) * 60
            },

            label: "mps"
        },

        mph:
        {
            label: "mph"
        },

        kph:
        {
            label: "kph"
        },

        metersPerMinute:
        {
            label: "m/min"
        },

        yardsPerMinute:
        {
            label: "yds/min"
        },

        hours:
        {
            label: "hms",

            conversion:
            {
                minutes: 60,
                seconds: 3600
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
        var definitionsForUnits = unitDefinitions[unitsType];
        var conversionFactor = definitionsForUnits[userUnitsKey];

        if (sportTypeName && definitionsForUnits.hasOwnProperty(sportTypeName) && definitionsForUnits[sportTypeName].hasOwnProperty(userUnitsKey))
        {
            conversionFactor = definitionsForUnits[sportTypeName][userUnitsKey];
        }

        if(_.isString(conversionFactor))
        {
            conversionFactor = lookupUnitsConversionFactor(definitionsForUnits.baseUnits, conversionFactor);
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

        if (!unitDefinitions.hasOwnProperty(unitsType))
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
            if(!_.has(unitDefinitions, baseUnits) || !_.has(unitDefinitions[baseUnits], "conversions") || !_.has(unitDefinitions[baseUnits].conversions, conversionUnits))
            {
                throw new Error("Invalid conversion factors (" + baseUnits + ", " + conversionUnits + ")");
            }
            return unitDefinitions[baseUnits].conversions[conversionUnits];
        }
    };

    var lookupUnitsLabels = function(baseUnits)
    {
        if(!_.has(unitDefinitions, baseUnits) || !_.has(unitDefinitions[baseUnits], "label"))
        {
            throw new Error("Invalid units for labels " + baseUnits);
        }
        return unitDefinitions[baseUnits].label;
    };

    return {
        lookupUserUnitsFactor: lookupUserUnitsFactor,
        lookupUnitsConversionFactor: lookupUnitsConversionFactor,
        lookupUnitslabel: lookupUnitsLabels,
        unitDefinitions: unitDefinitions
    };
});
