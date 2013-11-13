define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{

    function workoutTypeCssName(workoutTypeId)
    {
        if(!workoutTypeId)
        {
            return "";
        }
        var typeName = TP.utils.workout.types.getNameById(workoutTypeId);
        // Remove any non alpha characters
        typeName = typeName.replace(/ /g, "");
        return typeName;
    }

    Handlebars.registerHelper("workoutTypeCssName", workoutTypeCssName);
    return workoutTypeCssName;
});
