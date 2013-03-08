define(
[
    "handlebars",
    "utilities/workoutDistanceTimeOrTSS"
],
function (Handlebars, workoutDistanceTimeOrTSS)
{
    Handlebars.registerHelper("workoutDistanceTimeOrTSS", workoutDistanceTimeOrTSS);
    return workoutDistanceTimeOrTSS;
});