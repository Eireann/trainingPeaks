define(
[
    "utilities/units/constants",
    "utilities/workout/layoutFormatter"
],
function(unitsConstants, workoutLayoutFormatter)
{

    var unitsHash =
    {
        distance:
        {
            English: "mi",
            Metric: "km"
        },
        normalizedPace:
        {
            English: "min/mile",
            Metric: "min/km"
        },
        averagePace:
        {
            English: "min/mile",
            Metric: "min/km"
        },
        averageSpeed:
        {
            English: "mph",
            Metric: "km/h"
        },
        calories:
        {
            //English: "Cal", //1 Cal(orie) = 1kcal
            English: "kcal", //We currently only show kcal in flex app
            Metric: "kcal"
        },
        elevationGain:
        {
            English: "ft",
            Metric: "m"
        },
        elevationLoss:
        {
            English: "ft",
            Metric: "m"
        },
        //TODO: will need to add logic to determine type of tss
        tss:
        {
            English: "TSS",
            Metric: "TSS"
        },
        "if":
        {
            English: "IF",
            Metric: "IF"
        },
        energy:
        {
            English: "kJ",
            Metric: "kJ"
        },
        temperature:
        {
            English: "F",
            Metric: "C"
        },
        heartrate:
        {
            English: "bpm",
            Metric: "bpm"
        },
        pace:
        {
            English: "min/mile",
            Metric: "min/km"
        },
        speed:
        {
            English: "mph",
            Metric: "km/h"
        },
        cadence:
        {
            English: "rpm",
            Metric: "rpm"
        },
        torque:
        {
            English: "in/lbs",
            Metric: "Nm"
        },
        elevation:
        {
            English: "ft",
            Metric: "m"
        },
        power:
        {
            English: "W",
            Metric: "W"
        },
        time:
        {
            English: "hms",
            Metric: "hms"
        }
    };

    // TP.utils.units.getUnitsLabel(fieldName, sportType, context)
    var getUnitsLabel = function(fieldName, sportType, context)
    {
        var userUnits = theMarsApp.user.get("units");
        var userUnitsKey = userUnits === unitsConstants.English ? "English" : "Metric";

        if (!unitsHash.hasOwnProperty(fieldName))
            throw "Unknown field type (" + fieldName + ") for unit label";

        if (sportType !== undefined && unitsHash[fieldName].hasOwnProperty("bySportType") && unitsHash[fieldName].bySportType.hasOwnProperty(sportType))
            return unitsHash[fieldName][sportType][userUnitsKey];
        
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

        return unitsHash[fieldName][userUnitsKey];
    };

    return getUnitsLabel;
});