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

        // not enough data
        if(!workout.workoutDay)
        {
            return false;
        }

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