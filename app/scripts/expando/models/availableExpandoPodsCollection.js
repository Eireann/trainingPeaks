define(
[
    "TP"
],
function(
    TP)
{
    var AvailableExpandoPodsCollection = TP.Collection.extend(
    {
        model: TP.Model,

        comparator: "name",

        initialize: function(models, options)
        {
            if(!models)
            {
                this.addAllAvailableCharts();
            }
        },

        addAllAvailableCharts: function()
        {
            this.set([
            {
                podType: 1,
                name: "Map",
                cols: 2
            },
            {
                podType: 2,
                name: "Graph",
                cols: 2
            },
            {
                podType: 3,
                name: "Laps & Splits",
                cols: 2
            },
            {
                podType: 4, // Time In Zones
                variant: 1, // Heart Rate
                name: "Time In Zones - Heart Rate"
            },
            {
                podType: 5, // Peaks
                variant: 1, // Heart Rate
                name: "Peaks - Heart Rate"
            },
            {
                podType: 4, // Time In Zones
                variant: 2, // Power
                name: "Time In Zones - Power"
            },
            {
                podType: 5, // Peaks
                variant: 2, // Power
                name: "Peaks - Power"
            },
            {
                podType: 4, // Time In Zones
                variant: 3, // Speed
                name: "Time In Zones - Speed"
            },
            {
                podType: 5, // Peaks
                variant: 3, // Speed
                name: "Peaks - Speed"
            }
            ]);
        }

    });

    return AvailableExpandoPodsCollection;
});

