define(
[
],
function()
{
    function determineCompletedWorkout(workout)
    {
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