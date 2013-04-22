define(
[
    "handlebars",
    "utilities/determineCompletedWorkout"
],
function (Handlebars, determineCompletedWorkout)
{

        Handlebars.registerHelper("determineCompletedWorkout", determineCompletedWorkout);
        return determineCompletedWorkout;
});