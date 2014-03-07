define(
[
    "utilities/conversion/conversion"
],
function
(
    conversion
)
{

    function formatExerciseValue(planValue, minValue, displayUnits)
    {
        var value = null;

        if (arguments.length >= 3)
        {
            value = (planValue !== null && planValue !== undefined) ? planValue : minValue;
        }
        else
        {
            value = planValue;
            displayUnits = minValue;
        }

        if (value === null || value === undefined)
        {
            return "-";
        }

        switch (displayUnits)
        {
            case "HH:MM:SS":
                return conversion.formatUnitsValue("durationSeconds", value);

            case "min/mi":
            case "min/km":
                return conversion.formatUnitsValue("durationMinutes", value, { seconds: true });

            default:
                return value;
        }
    }

    return formatExerciseValue;
});
