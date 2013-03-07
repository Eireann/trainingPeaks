define(
[
    "handlebars",
    "utilities/workoutDistanceOrTime"
],
function (Handlebars, workoutDistanceOrTime)
{
    Handlebars.registerHelper("workoutDistanceOrTime", workoutDistanceOrTime);
    return workoutDistanceOrTime;
});