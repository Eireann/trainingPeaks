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
                podType: 153,
                name: "Map",
                cols: 2
            },
            {
                podType: 152,
                name: "Graph",
                cols: 2
            },
            {
                podType: 108,
                name: "Laps & Splits",
                cols: 2
            },
            {
                podType: 156,
                name: "Scatter Graph",
                cols: 2
            },
            {
                podType: 102, // Time In Zones
                name: "Time In Zones - Heart Rate"
            },
            {
                podType: 118, // Peaks
                name: "Peaks - Heart Rate"
            },
            {
                podType: 101, // Time In Zones
                name: "Time In Zones - Power"
            },
            {
                podType: 111, // Peaks
                name: "Peaks - Power"
            },
            {
                podType: 122, // Time In Zones
                name: "Time In Zones - Speed"
            },
            {
                podType: 119, // Peaks
                name: "Peaks - Speed"
            }
            ]);
        }

    });

    return AvailableExpandoPodsCollection;
});
