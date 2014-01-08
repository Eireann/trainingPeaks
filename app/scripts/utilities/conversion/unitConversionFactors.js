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
                yards: 1.0936133,
                feet: 3.28084
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
                secondsPerHundredYards: (1.0936133 / 100) * 60 * 60,
                secondsPerHundredMeters: (1 / 100) * 60 * 60
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

        degreesFahrenheit:
        {
            label: "F"
        },

        degreesCelsius:
        {
            label: "C"
        },

        hours:
        {
            label: "h:m:s",

            conversions:
            {
                minutes: 60,
                seconds: 3600
            }
        },

        minutes:
        {
            conversions:
            {
                hours: 1 / 60
            }
        },

        seconds: 
        {
            conversions:
            {
                hours: 1 / 3600
            }
        },

        milliseconds:
        {
            conversions:
            {
                hours: 1 / (3600 * 1000)
            }
        },

        feet:
        {
            label: "ft"
        },

        efficiencyFactorRaw:
        {
            label: "EF",

            conversions:
            {
                efficiencyFactorMetric: 60,
                efficiencyFactorEnglish: 60 * 1.09361
            }
        },

        newtonMeters:
        {
            label: "Nm",

            conversions:
            {
                inchPounds: 8.850745793490558
            }
        },

        inchPounds:
        {
            label: "in-lbs"
        },

        cm:
        {
            conversions:
            {
                inch: 0.393701
            }
        },

        mm:
        {
            conversions:
            {
                cm: 0.1,
                inch: 0.0393701
            }
        },
        
        kg:
        {
            conversions:
            {
                pound: 2.20462
            }
        },

        ml:
        {
            conversions:
            {
                oz: 0.033814
            }
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
        lookupUnitsConversionFactor: lookupUnitsConversionFactor,
        lookupUnitslabel: lookupUnitsLabels,
        unitDefinitions: unitDefinitions
    };
});
