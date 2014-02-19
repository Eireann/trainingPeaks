define(
[
    "handlebars",
    "TP"
],
function(
    Handlebars,
    TP
)
{
    function formatExerciseValue(value, displayUnits)
    {
        return TP.utils.workout.formatExerciseValue(value, displayUnits);
    }

    Handlebars.registerHelper(
        "formatExerciseValue",
        formatExerciseValue
    );

    return formatExerciseValue;
});
