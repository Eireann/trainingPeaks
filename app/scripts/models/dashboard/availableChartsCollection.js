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

        initialize: function(models, options)
        {

            if(!options || !options.featureAuthorizer)
            {
                throw new Error("Available Charts Collection requires a feature authorizer");
            }

            this.featureAuthorizer = options.featureAuthorizer;
            this.on("add", this._checkPremiumAccess, this);

            if(!models)
            {
                this.addAllAvailableCharts();
            }
        },

        addAllAvailableCharts: function()
        {
            this.reset([]);
            this.add([
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
            }
            ]);
        },

        _checkPremiumAccess: function(model)
        {
            var featureAttributes = { podTypeId: model.get("chartType") };

            // this collection should only contain items the user is allowed to view 
            if(!this.featureAuthorizer.canAccessFeature(
               this.featureAuthorizer.features.ViewPod,
               featureAttributes
               )
            )
            {
                this.remove(model);
                return;
            }

            // mark items the user is not allowed to use 
            if(!this.featureAuthorizer.canAccessFeature(
               this.featureAuthorizer.features.UsePod,
               featureAttributes
               )
            )
            {
                model.set("premium", true);
            }
            else
            {
                model.set("premium", false);
            }
        }
    });

    return AvailableChartsCollection;
});
