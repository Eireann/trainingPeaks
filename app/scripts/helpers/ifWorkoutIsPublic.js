define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{

    var PUBLIC = 1;
    var PRIVATE = 2;

    var ifWorkoutIsPublic = function(workout, options)
    {
        var isPublic = Number(workout.publicSettingValue) === PUBLIC && TP.utils.workout.determineCompletedWorkout(workout);

        if(isPublic)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifWorkoutIsPublic", ifWorkoutIsPublic);
    return ifWorkoutIsPublic;
});