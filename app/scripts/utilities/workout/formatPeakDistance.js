define(
[
],
function()
{
    function formatPeakDistance(interval)
    {
        if (interval % 1609 === 0)
        {
            return (interval / 1609) + " mile";
        } else if (interval % 1000 !== 0)
        {
            return interval + " m";
        } else 
        {
            return (interval / 1000) + " km";
        }

    }

    return formatPeakDistance;
});