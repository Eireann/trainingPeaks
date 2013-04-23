define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("workoutTypeName", TP.utils.workoutTypes.getNameById);
    return TP.utils.workoutTypes.getNameById;
});