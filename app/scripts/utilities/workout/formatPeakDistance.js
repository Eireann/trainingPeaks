define(
[
],
function()
{

    var distanceLabels = {
        400: "400 m",
        800: "800 m",
        1000: "1 km",
        1600: "1600 m",
        1609: "1 mi",
        5000: "5 km",
        8047: "5 mile",
        10000: "10 km",
        15000: "15 km",
        16094: "10 mi",
        21097: "1/2 Marathon",
        30000: "30 km",
        42195: "Marathon",
        50000: "50 km",
        100000: "100 km",
        160934: "100 mi"
    };

    function formatPeakDistance(interval)
    {
        if (distanceLabels[interval])
        {
            return distanceLabels[interval];
        }
    }

    return formatPeakDistance;
});