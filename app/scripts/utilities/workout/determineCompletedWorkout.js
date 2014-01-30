define(
[
    "moment",
    "utilities/datetime/datetime"
],
function(moment, datetime)
{
    function determineCompletedWorkout(workout)
    {

        // workout can be a model or an object/json
        if (!workout.hasOwnProperty("workoutDay") && workout.hasOwnProperty("attributes"))
        {
            workout = workout.attributes;
        }

        // not completed in future ...
        if (workout.workoutDay && datetime.isFuture(workout.workoutDay))
        {
            return false;
        }

        if (workout.calories || workout.distance || workout.elevationGain || workout.energy || workout.normalizedPowerActual || workout.normalizedSpeedActual || workout.totalTime || workout.tssActual)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    return determineCompletedWorkout;
});