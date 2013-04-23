define(
[
    "TP"
],
function (TP)
{
    function getKeyStatField(workout)
    {
        // we might have a Backbone workoutModel, or we might have a raw JSON object ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
            workout = workout.attributes;

        var keyStat = "";

        if (TP.utils.workout.determineCompletedWorkout(workout))
        {
            if (workout.distance)
            {
                keyStat = "distance";
            } else if (workout.totalTime)
            {
                keyStat = "totalTime";
            } else if (workout.tssActual)
            {
                keyStat = "tssActual";
            }
        } else
        {
            if (workout.distancePlanned)
            {
                keyStat = "distancePlanned";
            } else if (workout.totalTimePlanned)
            {
                keyStat = "totalTimePlanned";
            } else if (workout.tssPlanned)
            {
                keyStat = "tssPlanned";
            } else
            {
                keyStat = "";
            }
        }

        return keyStat;
    }

    return getKeyStatField;
});