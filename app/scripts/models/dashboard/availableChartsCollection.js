define(
[
    "shared/models/premiumPodsCollection",
    "shared/models/expandoPodSettingsModel"
],
function(
    PremiumPodsCollection,
    ExpandoPodSettingsModel
    )
{
    var AvailableChartsCollection = PremiumPodsCollection.extend(
    {
        podTypeIdAttribute: "chartType",

        model: ExpandoPodSettingsModel,

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
                chartType: 32,
                name: "Performance Manager"
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
            },
            {
                chartType: 19,
                name: "Longest Workout (Distance)"
            },
            {
                chartType: 20,
                name: "Longest Workout (Duration)"
            },
            {
                chartType: 35,
                name: "Fitness History"
            }
            ]);
        }
        
    });

    return AvailableChartsCollection;
});
