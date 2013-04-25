define(
[
    "utilities/units/constants",
    "utilities/workout/layoutFormatter"
],
function(unitConstants, workoutLayoutFormatter)
{

    var ENGLISH = unitConstants.English;
    var METRIC = unitConstants.Metric;

    var unitsHash =
    {
        distance:
        {
            ENGLISH: "mi",
            METRIC: "km"
        },
        normalizedPace:
        {
            ENGLISH: "min/mile",
            METRIC: "min/km"
        },
        averagePace:
        {
            ENGLISH: "min/mile",
            METRIC: "min/km"
        },
        averageSpeed:
        {
            ENGLISH: "mph",
            METRIC: "km/h"
        },
        calories:
        {
            //ENGLISH: "Cal", //1 Cal(orie) = 1kcal
            ENGLISH: "kcal", //We currently only show kcal in flex app
            METRIC: "kcal"
        },
        elevationGain:
        {
            ENGLISH: "ft",
            METRIC: "m"
        },
        elevationLoss:
        {
            ENGLISH: "ft",
            METRIC: "m"
        },
        //TODO: will need to add logic to determine type of tss
        tss:
        {
            ENGLISH: "TSS",
            METRIC: "TSS"
        },
        "if":
        {
            ENGLISH: "IF",
            METRIC: "IF"
        },
        energy:
        {
            ENGLISH: "kJ",
            METRIC: "kJ"
        },
        temperature:
        {
            ENGLISH: "F",
            METRIC: "C"
        },
        heartrate:
        {
            ENGLISH: "bpm",
            METRIC: "bpm"
        },
        pace:
        {
            ENGLISH: "min/mile",
            METRIC: "min/km"
        },
        speed:
        {
            ENGLISH: "mph",
            METRIC: "km/h"
        },
        cadence:
        {
            ENGLISH: "rpm",
            METRIC: "rpm"
        },
        torque:
        {
            ENGLISH: "ft/lbs",
            METRIC: "Nm"
        },
        elevation:
        {
            ENGLISH: "ft",
            METRIC: "m"
        },
        power:
        {
            ENGLISH: "W",
            METRIC: "W"
        },
        time:
        {
            ENGLISH: "hms",
            METRIC: "hms"
        }
    };

    // TP.utils.units.getUnitsLabel(fieldName, sportType, context)
    var getUnitsLabel = function(fieldName, sportType, context)
    {
        var currentUnits = theMarsApp.user.get("units");
        if (!unitsHash.hasOwnProperty(fieldName))
            throw "Unknown field type (" + fieldName + ") for unit label";

        if (sportType !== undefined && unitsHash[fieldName].hasOwnProperty("bySportType") && unitsHash[fieldName].bySportType.hasOwnProperty(sportType))
            return unitsHash[fieldName][sportType][currentUnits];
        
        //TODO: refactor
        if (context && fieldName === "tss")
        {
            var tssSource = "";
            if (context.hasOwnProperty("tssSource"))
            {
                tssSource = context.tssSource;
            } else if (context.hasOwnProperty("model"))
            {
                tssSource = context.model.get("tssSource");
            }

            if (tssSource && workoutLayoutFormatter.trainingStressScoreSource[tssSource])
            {
                return workoutLayoutFormatter.trainingStressScoreSource[tssSource].abbreviation;
            }
        }

        return unitsHash[fieldName][currentUnits];
    };

    return getUnitsLabel;
});