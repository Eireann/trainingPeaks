define(
[
    "handlebars",
    "underscore",
    "TP"
],
function (Handlebars, _, TP)
{

    var workoutTypeMatches = function(actualWorkoutTypeId, allowableWorkoutTypeNames)
    {
        var actualWorkoutTypeName = TP.utils.workout.types.getNameById(actualWorkoutTypeId).toLowerCase();

        var matchingName = _.find(allowableWorkoutTypeNames, function(expectedWorkoutTypeName)
        {
            return expectedWorkoutTypeName.toLowerCase() === actualWorkoutTypeName;
        });

        return matchingName ? true : false;
    };

    var ifWorkoutType = function()
    {
        var args = Array.prototype.slice.call(arguments);
        var actualWorkoutTypeId = args.shift();
        var options = args.pop();

        if (workoutTypeMatches(actualWorkoutTypeId, args))
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
