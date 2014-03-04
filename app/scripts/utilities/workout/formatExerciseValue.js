define(
[
    "utilities/conversion/conversion"
],
function
(
    conversion
)
{

    function formatExerciseValue(value, displayUnits)
    {
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
