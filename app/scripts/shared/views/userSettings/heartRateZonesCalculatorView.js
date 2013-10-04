define(
[
    "underscore",
    "TP",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/zoneCalculatorViews",
    "hbs!shared/templates/userSettings/heartRateZonesCalculatorZoneItemTemplate",
    "hbs!shared/templates/userSettings/heartRateZonesCalculatorTemplate"
],
function(
    _,
    TP,
    ZoneCalculatorDefinitions,
    ZoneCalculator,
    ZoneCalculatorViews,
    heartRateZoneTemplate,
    heartRateZonesCalculatorTemplate
    )
{

    function filterCalculators(type)
    {
        return _.filter(ZoneCalculatorDefinitions.heartRate, function(zoneCalculator) {
            return zoneCalculator.type === type; 
        });
    }

    var HeartRateCalculatorTabView = ZoneCalculatorViews.TabContentView.extend({

        fieldsToCopyFromParentModel: ["threshold", "minimumHeartRate", "maximumHeartRate"],

        zoneTypesById: ZoneCalculatorDefinitions.heartRatesById,

        zoneCalculator: ZoneCalculator.HeartRate,

        units: "heartrate",

        itemView: TP.ItemView.extend({
            template: {
                type: "handlebars",
                template: heartRateZoneTemplate
            }
        }),

        template: {
            type: "handlebars",
            template: heartRateZonesCalculatorTemplate
        }

    });

    var LactateThresholdTabView = HeartRateCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.heartRateTypes.LactateThreshold),
        inputs: [ "threshold" ]
    });

    var MaximumHeartRateTabView = HeartRateCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.heartRateTypes.MaximumHeartRate),
        inputs: [ "maximumHeartRate" ]
    });

    var MaximumAndRestingHeartRateTabView = HeartRateCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.heartRateTypes.MaxAndRestingHeartRate),
        inputs: [ "maximumHeartRate", "restingHeartRate"]
    });

    var LactateThresholdAndMaximumHeartRateTabView = HeartRateCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.heartRateTypes.LTAndMaxHeartRate),
        inputs: [ "maximumHeartRate", "testResult" ],

        _applyFormValuesToModel: function()
        {
            ZoneCalculatorViews.TabContentView.prototype._applyFormValuesToModel.call(this);
            if(this.model.get("testResult"))
            {
                this.model.set("threshold", this.model.get("testResult"));
            }
        }
    });

    var HeartRateZonesCalculatorTabbedLayout = ZoneCalculatorViews.TabbedLayout.extend({

        className: "tabbedLayout zonesCalculator heartRateZonesCalculator",

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Lactate Threshold",
                    view: LactateThresholdTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Maximum Heart Rate",
                    view: MaximumHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Max and Resting Heart Rate",
                    view: MaximumAndRestingHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "LT and Maximum Heart Rate",
                    view: LactateThresholdAndMaximumHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                }
            ];

        }

    });

    return HeartRateZonesCalculatorTabbedLayout;
});
