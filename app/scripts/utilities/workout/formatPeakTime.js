define(
[
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(conversion, getKeyStatField)
{
    function formatPeakTime(interval)
    {
        return interval + " sec";
    }

    return formatPeakTime;
});