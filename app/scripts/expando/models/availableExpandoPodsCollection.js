define(
[
    "shared/models/premiumPodsCollection"
],
function(
    PremiumPodsCollection
    )
{
    var AvailableExpandoPodsCollection = PremiumPodsCollection.extend(
    {

        podTypeIdAttribute: "podType",

        initialize: function(models, options)
        {
            this.constructor.__super__.initialize.call(this, models, options);

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
                name: "Time In Zones - Heart Rate",
                cols: 1
            },
            {
                podType: 118, // Peaks
                name: "Peaks - Heart Rate",
                cols: 1
            },
            {
                podType: 101, // Time In Zones
                name: "Time In Zones - Power",
                cols: 1
            },
            {
                podType: 111, // Peaks
                name: "Peaks - Power",
                cols: 1
            },
            {
                podType: 122, // Time In Zones
                name: "Time In Zones - Speed",
                cols: 1
            },
            {
                podType: 119, // Peaks
                name: "Peaks - Speed",
                cols: 1
            }
            ]);
        }
    });

    return AvailableExpandoPodsCollection;
});
