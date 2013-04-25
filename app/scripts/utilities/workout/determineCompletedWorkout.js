define(
[
    "moment",
    "utilities/datetime/datetime"
],
function(moment, datetime)
{
    function determineCompletedWorkout(workout)
    {
        // not completed in future ...
        if (moment(workout.workoutDay).format(datetime.shortDateFormat) > moment().format(datetime.shortDateFormat))
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