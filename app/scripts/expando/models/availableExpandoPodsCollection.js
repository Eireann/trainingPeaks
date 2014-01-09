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
                widthInColumns: 2
            },
            {
                podType: 152,
                name: "Graph",
                widthInColumns: 2
            },
            {
                podType: 108,
                name: "Laps & Splits",
                widthInColumns: 2
            },
            {
                podType: 156,
                name: "Scatter Graph",
                widthInColumns: 2
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
            },
            /*
            {
                podType: 157, // Data Grid
                name: "Data Grid",
                widthInColumns: 2
            },
            */
            {
                podType: 1081,
                name: "Laps & Splits Column Chart",
                widthInColumns: 2
            }
            ]);
        }
    });

    return AvailableExpandoPodsCollection;
});
