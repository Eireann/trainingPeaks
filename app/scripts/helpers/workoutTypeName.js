define(
[
    "handlebars",
    "utilities/workoutTypeName"
],
function(Handlebars, workoutTypeName)
{
    Handlebars.registerHelper("workoutTypeName", workoutTypeName);
    return workoutTypeName;
});