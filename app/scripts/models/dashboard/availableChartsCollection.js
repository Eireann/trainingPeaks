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
                chartType: 18,
                name: "Time In HR Zones By Week"
            },
            {
                chartType: 25,
                name: "Time In Power Zones By Week"
            },
            {
                chartType: 27,
                name: "Time In Speed Zones By Week"
            },
            ]);
        }
    });

    return AvailableChartsCollection;
});
