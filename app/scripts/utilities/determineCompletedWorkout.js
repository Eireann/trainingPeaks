define(
[
    "moment",
    "TP"
],
function(moment, TP)
{
    function determineCompletedWorkout(workout)
    {
        // not completed in future ...
        if (moment(workout.workoutDay).format(TP.utils.datetime.shortDateFormat) > moment().format(TP.utils.datetime.shortDateFormat))
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