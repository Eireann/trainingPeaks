define(
[
    "handlebars",
    "utilities/workoutTypeName"
],
function(Handlebars, workoutTypeName)
{

    function workoutTypeImageName(workoutTypeId)
    {
        var typeName = workoutTypeName(workoutTypeId);
        // Remove any non alpha characters
        typeName = typeName.replace(/[^a-z]/ig, "");
        return typeName;
    }


    Handlebars.registerHelper("workoutTypeImageName", workoutTypeImageName);
    return workoutTypeName;
});