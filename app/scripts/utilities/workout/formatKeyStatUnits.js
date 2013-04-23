define(
[
    "utilities/workout/determineCompletedWorkout",
    "utilities/units/units"
],
function(determineCompletedWorkout, unitsUtils)
{

    function formatKeyStatUnits(workout)
    {
        // we might have a Backbone workoutModel, or we might have a raw JSON object ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
            workout = workout.attributes;

        var units = " ";

        if (determineCompletedWorkout(workout))
        {
            if (workout.distance)
            {
                units = unitsUtils.getUnitsLabel("distance");
            }
            else if (workout.totalTime)
            {
                units = "";
            }
            else if (workout.tssActual)
            {
                units = "TSS";
            }
        }
        else
        {
            if (workout.distancePlanned)
            {
                units = unitsUtils.getUnitsLabel("distance");
            }
            else if(workout.totalTimePlanned)
            {
                units = "";
            }
            else if (workout.tssPlanned)
            {
                units = "TSS";
            }
            else
            {
                units = "";
            }
        }

        return units;
    }

    return formatKeyStatUnits;
});