define(
[
    "TP"
],
function(
    TP)
{
    var AvailableChartsCollection = TP.Collection.extend(
    {
        model: TP.Model,

        initialize: function()
        {
            this.add([
            {
                chartType: 32,
                name: "PMC"
            },
            {
                chartType: 3,
                name: "Fitness Summary"
            },
            {
                chartType: 8,
                name: "Peak Power"
            },
            {
                chartType: 28,
                name: "Peak HR"
            },
            {
                chartType: 29,
                name: "Peak Cadence"
            },
            {
                chartType: 30,
                name: "Peak Speed"
            },
            {
                chartType: 31,
                name: "Peak Pace"
            },
            {
                chartType: 36,
                name: "Peak Pace by Distance"
            },
            {
                chartType: 17,
                name: "Time In HR Zones"
            },
            {
                chartType: 24,
                name: "Time In Power Zones"
            },
            {
                chartType: 26,
                name: "Time In Speed Zones"
            },
            {
                chartType: 13,
                name: "Metrics"
            },
            {
                chartType: 10,
                name: "Duration by Week/Day"
            },
            {
                chartType: 11,
                name: "Distance by Week/Day"
            },
            {
                chartType: 21,
                name: "Kilojoules by Week/Day"
            },
            {
                chartType: 23,
                name: "TSS by Week/Day"
            },
            {
                chartType: 37,
                name: "Elevation Gain by Day/Week"
            }
            ]);
        }
    });

    return AvailableChartsCollection;
});
