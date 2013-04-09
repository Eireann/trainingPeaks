define(
[
    "utilities/determineCompletedWorkout",
    "utilities/conversion",
    "utilities/printTimeFromDecimalHours"
],
function(determineCompletedWorkout, conversion, printTimeFromDecimalHours)
{

    function printKeyStat(workout)
    {
        // we might have a Backbone workoutModel, or we might have a raw JSON object ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
            workout = workout.attributes;

        var wdt = " ";

        if (determineCompletedWorkout(workout))
        {
            if (workout.distance)
            {
                wdt = conversion.convertToViewUnits(workout.distance, "distance");
            }
            else if (workout.totalTime)
            {
                wdt = printTimeFromDecimalHours(workout.totalTime);
            }
            else if (workout.tssActual)
            {
                wdt = workout.tssActual;
            }
        }
        else
        {
            if (workout.distancePlanned)
            {
                wdt = conversion.convertToViewUnits(workout.distancePlanned, "distance");
            }
            else if(workout.totalTimePlanned)
            {
                wdt = printTimeFromDecimalHours(workout.totalTimePlanned);
            }
            else if (workout.tssPlanned)
            {
                wdt = workout.tssPlanned;
            }
            else
            {
                wdt = "";
            }
        }

        return wdt;
    }

    return printKeyStat;
});