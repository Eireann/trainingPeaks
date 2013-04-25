define(
[
    "utilities/units/constants"
],
function(unitConstants)
{
    var ENGLISH = unitConstants.English;
    var METRIC = unitConstants.Metric;

    // Conversion factors from Model units (metric) to view units.
    // Use inverse (1/*) for View to Model conversion.
    return {
        "distance":
        {
            ENGLISH: 0.000621371,
            METRIC: 0.001
        },
        "pace":
        {
            ENGLISH: 26.8224,
            METRIC: 16.666666666667
        },
        "speed":
        {
            ENGLISH: 2.236936,
            METRIC: 3.6
        },
        "elevation":
        {
            ENGLISH: 3.28084,
            METRIC: 1
        }
    };
});