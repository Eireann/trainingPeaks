define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    Handlebars.registerHelper("determineCompletedWorkout", TP.utils.workout.determineCompletedWorkout);
    return TP.utils.workout.determineCompletedWorkout;
});