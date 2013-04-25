define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("workoutTypeName", TP.utils.workout.types.getNameById);
    return TP.utils.workout.types.getNameById;
});