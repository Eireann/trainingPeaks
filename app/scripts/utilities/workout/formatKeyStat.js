define(
[
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(conversion, getKeyStatField)
{

    function getWorkoutAttributes(workout)
    {
        // we might have a Backbone workoutModel, if this was called directly,
        // or we might have a JSON object if it was called via our backbone helper ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
        {
            return workout.attributes;
        } else
        {
            return workout;
        }
    }

    function formatKeyStat(workout)
    {
        var workoutAttributes = getWorkoutAttributes(workout);

        var keyStatField = getKeyStatField(workoutAttributes);
        var value = workoutAttributes[keyStatField];
        
        if (keyStatField === "distance" || keyStatField === "distancePlanned")
        {
            return conversion.formatUnitsValue("distance", value, { workoutTypeValueId: workoutAttributes.workoutTypeValueId });
        }
        else if (keyStatField === "totalTime" || keyStatField === "totalTimePlanned")
        {
            return conversion.formatUnitsValue("duration", value);
        }
        else if (keyStatField === "tssActual" || keyStatField === "tssPlanned")
        {
            return conversion.formatUnitsValue("tss", value);
        } else
        {
            return "";
        }
    }

    return formatKeyStat;
});