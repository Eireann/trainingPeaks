define(
[
],
function()
{
    // Conversion factors from Model units (metric) to view units.
    // Use inverse (1/*) for View to Model conversion.
    return {
        "distance":
        {
            "0": 0.000621371,
            "1": 0.001
        },
        "pace":
        {
            "0": 26.8224,
            "1": 16.666666666667
        },
        "speed":
        {
            "0": 2.236936,
            "1": 3.6
        },
        "elevation":
        {
            "0": 3.28084,
            "1": 1
        }
    };
});