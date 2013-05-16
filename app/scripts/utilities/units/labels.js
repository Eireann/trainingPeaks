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
            English: "min/mi",
            Metric: "min/km"
        },
        averagePace:
        {
            English: "min/mi",
            Metric: "min/km"
        },
        averageSpeed:
        {
            English: "mph",
            Metric: "kph"
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
            English: "min/mi",
            Metric: "min/km"
        },
        speed:
        {
            English: "mph",
            Metric: "kph"
        },
        cadence:
        {
            English: "rpm",
            Metric: "rpm"
        },
        torque:
        {
            English: "in-lbs",
            Metric: "Nm"
        },
        elevation:
        {
            English: "ft",
            Metric: "m"
        },
        power:
        {
            English: "watts",
            Metric: "watts"
        },
        rightpower:
        {
            English: "watts",
            Metric: "watts"
        },
        time:
        {
            English: "hms",
            Metric: "hms"
        },
        vam:
        {
            English: "meters/hr",
            Metric: "meters/hr"
        }

    };

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