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
            return conversion.formatDistance(value);
        }
        else if (keyStatField === "totalTime" || keyStatField === "totalTimePlanned")
        {
            return conversion.formatDuration(value);
        }
        else if (keyStatField === "tssActual" || keyStatField === "tssPlanned")
        {
            return conversion.formatTSS(value);
        } else
        {
            return "";
        }
    }

    return formatKeyStat;
});