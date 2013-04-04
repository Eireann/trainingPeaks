define(
[],
function()
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
        tss:
        {
            "0": "",
            "1": ""
        },
        "if":
        {
            "0": "",
            "1": ""
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
        }
    };
    
    var printUnitLabel = function(fieldName, sportType)
    {
        var currentUnits = theMarsApp.user.get("units");
        if (!unitsHash.hasOwnProperty(fieldName))
            throw "Unknown field type (" + fieldName + ") for unit label";

        if (sportType !== undefined && unitsHash[fieldName].hasOwnProperty(sportType))
            return unitsHash[fieldName][sportType][currentUnits];
        
        return unitsHash[fieldName][currentUnits];
    };

    return printUnitLabel;
});