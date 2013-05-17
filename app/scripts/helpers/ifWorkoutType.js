define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    var ifWorkoutType = function(actualWorkoutTypeId, expectedWorkoutTypeName, options)
    {
        var actualWorkoutTypeName = TP.utils.workout.types.getNameById(actualWorkoutTypeId);

        if (actualWorkoutTypeName.toLowerCase() === expectedWorkoutTypeName.toLowerCase())
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifWorkoutType", ifWorkoutType);
    return ifWorkoutType;
});