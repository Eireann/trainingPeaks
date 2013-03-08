define(
[
    "utilities/determineCompletedWorkout",
    "utilities/convertToViewUnits",
    "utilities/printUnitLabel",
    "utilities/printTimeFromDecimalHours"
],
function (determineCompletedWorkout, convertToViewUnits, printUnitLabel, printTimeFromDecimalHours)
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
                wdt = convertToViewUnits(workout.distance, "distance") + " " + printUnitLabel("distance");
            }
            else if (workout.totalTime)
            {
                wdt = printTimeFromDecimalHours(workout.totalTime);
            }
            else if (workout.tssActual)
            {
                wdt = workout.tssActual + " tss";
            }
            else
            {
                wdt = "";
            }
        }
        else
        {
            if (workout.distancePlanned)
            {
                wdt = convertToViewUnits(workout.distancePlanned, "distance") + " " + printUnitLabel("distance");
            }
            else if(workout.totalTimePlanned)
            {
                wdt = printTimeFromDecimalHours(workout.totalTimePlanned);
            }
            else if (workout.tssPlanned)
            {
                wdt = workout.tssPlanned + " tss";
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