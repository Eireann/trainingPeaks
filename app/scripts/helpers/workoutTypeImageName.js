define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{

    function workoutTypeImageName(workoutTypeId)
    {
        var typeName = TP.utils.workoutTypes.getNameById(workoutTypeId);
        // Remove any non alpha characters
        typeName = typeName.replace(/[^a-z]/ig, "");
        return typeName;
    }

    Handlebars.registerHelper("workoutTypeImageName", workoutTypeImageName);
    return workoutTypeImageName;
});