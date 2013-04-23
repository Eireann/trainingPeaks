define(
[
    "TP",
    "utilities/determineCompletedWorkout"
],
function (TP, determineCompletedWorkout)
{

    function printKeyStatUnits(workout)
    {
        // we might have a Backbone workoutModel, or we might have a raw JSON object ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
            workout = workout.attributes;

        var units = " ";

        if (determineCompletedWorkout(workout))
        {
            if (workout.distance)
            {
                units = TP.utils.units.getUnitsLabel("distance");
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
                units = TP.utils.units.getUnitsLabel("distance");
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

    return printKeyStatUnits;
});