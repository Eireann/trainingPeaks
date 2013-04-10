define(
[
    "moment"
],
function(moment)
{
    function determineCompletedWorkout(workout)
    {
        // not completed in future ...
        if (moment(workout.workoutDay).format("YYYY-MM-DD") > moment().format("YYYY-MM-DD"))
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