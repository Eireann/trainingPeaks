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

    var getTssLabel = function(context)
    {

        var tssSource = "";
        var tssSourceKeys = ["tssSource", "trainingStressScoreActualSource"];
        var contexts = [context];
        if (context.hasOwnProperty("model"))
        {
            contexts.push(context.model.attributes);
        }

        _.each(contexts, function(ctx)
        {
            _.each(tssSourceKeys, function(key)
            {
                if (ctx.hasOwnProperty(key))
                {
                    tssSource = ctx[key];
                }
            });
        });

        // in workout it's an int, tssSource, and in lap/peak detail data it's a string
        if (tssSource && workoutLayoutFormatter.trainingStressScoreSource[tssSource])
        {
            return workoutLayoutFormatter.trainingStressScoreSource[tssSource].abbreviation;
        } else if (tssSource)
        {
            var label = _.find(workoutLayoutFormatter.trainingStressScoreSource, function(tssLabel)
            {
                return tssLabel.name === tssSource;
            });

            if(label)
            {
                return label.abbreviation;
            }
        }

        return "";
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
        if (fieldName === "tss")
        {
            return getTssLabel(context);
        }
        
        return unitsHash[fieldName][userUnitsKey];
    };

    return getUnitsLabel;
});