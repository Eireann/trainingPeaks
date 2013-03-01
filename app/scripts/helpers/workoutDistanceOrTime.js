define(
[
    "handlebars"
],
function (Handlebars)
{

    function workoutDistanceOrTime(workout)
    {
        var wdt = " ";
        if (workout.totalTime)
        {
            if (workout.distance)
            {
                wdt = workout.distance;
            }
            else
            {
                wdt = workout.totalTime;
            }
        }
        else
        {
            if (workout.distancePlanned)
            {
                wdt = workout.distancePlanned;
            }
            else
            {
                wdt = workout.totalTimePlanned;
            }
        }

        return wdt;
    }


    Handlebars.registerHelper("workoutDistanceOrTime", workoutDistanceOrTime);
    return workoutDistanceOrTime;
});