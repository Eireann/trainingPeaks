define(
[
    "utilities/determineCompletedWorkout",
    "utilities/printUnitLabel"
],
function (determineCompletedWorkout, printUnitLabel)
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
                units = printUnitLabel("distance");
            }
            else if (workout.totalTime)
            {
                units = "";
            }
            else if (workout.tssActual)
            {
                units = "tss";
            }
        }
        else
        {
            if (workout.distancePlanned)
            {
                units = printUnitLabel("distance");
            }
            else if(workout.totalTimePlanned)
            {
                units = "";
            }
            else if (workout.tssPlanned)
            {
                units = "tss";
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