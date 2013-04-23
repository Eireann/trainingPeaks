define(
[
    "utilities/workout/layoutFormatter"
],
function(workoutLayoutFormatter)
{
    var unitsHash =
    {
        distance:
        {
            "0": "mi",
            "1": "km"
        },
        normalizedPace:
        {
            "0": "min/mile",
            "1": "min/km"
        },
        averagePace:
        {
            "0": "min/mile",
            "1": "min/km"
        },
        averageSpeed:
        {
            "0": "mph",
            "1": "km/h"
        },
        calories:
        {
            //"0": "Cal", //1 Cal(orie) = 1kcal
            "0": "kcal", //We currently only show kcal in flex app
            "1": "kcal"
        },
        elevationGain:
        {
            "0": "ft",
            "1": "m"
        },
        elevationLoss:
        {
            "0": "ft",
            "1": "m"
        },
        //TODO: will need to add logic to determine type of tss
        tss:
        {
            "0": "TSS",
            "1": "TSS"
        },
        "if":
        {
            "0": "IF",
            "1": "IF"
        },
        energy:
        {
            "0": "kJ",
            "1": "kJ"
        },
        temperature:
        {
            "0": "F",
            "1": "C"
        },
        heartrate:
        {
            "0": "bpm",
            "1": "bpm"
        },
        pace:
        {
            "0": "min/mile",
            "1": "min/km"
        },
        speed:
        {
            "0": "mph",
            "1": "km/h"
        },
        cadence:
        {
            "0": "rpm",
            "1": "rpm"
        },
        torque:
        {
            "0": "ft/lbs",
            "1": "Nm"
        },
        elevation:
        {
            "0": "ft",
            "1": "m"
        },
        power:
        {
            "0": "W",
            "1": "W"
        },
        time:
        {
            "0": "hms",
            "1": "hms"
        }
    };

    // TP.utils.units.getUnitsLabel(fieldName, sportType, viewContext)
    var getUnitsLabel = function(fieldName, sportType, viewContext)
    {
        var currentUnits = theMarsApp.user.get("units");
        if (!unitsHash.hasOwnProperty(fieldName))
            throw "Unknown field type (" + fieldName + ") for unit label";

        if (sportType !== undefined && unitsHash[fieldName].hasOwnProperty(sportType))
            return unitsHash[fieldName][sportType][currentUnits];
        
        //TODO: refactor
        if (viewContext && fieldName === "tss")
        {
            var tssSource = viewContext.model.get("tssSource");
            var tssAbbreviation = workoutLayoutFormatter.trainingStressScoreSource[tssSource].abbreviation;
            return tssAbbreviation;
        }

        return unitsHash[fieldName][currentUnits];
    };

    return getUnitsLabel;
});