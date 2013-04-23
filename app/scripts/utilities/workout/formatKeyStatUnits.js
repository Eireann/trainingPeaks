define(
[
    "utilities/workout/getKeyStatField",
    "utilities/units/units"
],
function(getKeyStatField, unitsUtils)
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

    function formatKeyStatUnits(workout)
    {
        var workoutAttributes = getWorkoutAttributes(workout);
        var keyStatField = getKeyStatField(workoutAttributes);
        
        if (keyStatField === "distance" || keyStatField === "distancePlanned")
        {
            return unitsUtils.getUnitsLabel("distance");
        }
        else if (keyStatField === "totalTime" || keyStatField === "totalTimePlanned")
        {
            return "";
        }
        else if (keyStatField === "tssActual" || keyStatField === "tssPlanned")
        {
            return "TSS";
        } else
        {
            return "";
        }
    }

    return formatKeyStatUnits;
});