define(
[
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(conversion, getKeyStatField)
{
    function formatPeakTime(interval)
    {
        if (interval < 90 || (interval % 60) !== 0)
        {
            return interval + " sec";
        } else
        {
            return (interval / 60) + " min";
        }
    }

    return formatPeakTime;
});