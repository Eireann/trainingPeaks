define(
[
    "utilities/datetime/datetime",
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(datetime, conversion, getKeyStatField)
{
    function formatKeyStat(workout)
    {
        // we might have a Backbone workoutModel, or we might have a raw JSON object ...
        if (workout.hasOwnProperty('attributes') && workout.attributes.hasOwnProperty('distance'))
            workout = workout.attributes;

        var keyStatField = getKeyStatField(workout);
        var value = workout[keyStatField];
        var returnValue = "";
        
        if (keyStatField === "distance" || keyStatField === "distancePlanned")
        {
            returnValue = conversion.convertToViewUnits(value, "distance");
        }
        else if (keyStatField === "totalTime" || keyStatField === "totalTimePlanned")
        {
            returnValue = datetime.format.decimalHoursAsTime(value, "distance");
        }
        else if (keyStatField === "tssActual" || keyStatField === "tssPlanned")
        {
            returnValue = value;
        }
        else
        {
            return returnValue;
        }

        return returnValue;
    }
    return formatKeyStat;
});