define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/data/zoneCalculators",
    "hbs!shared/templates/userSettings/heartRateZonesCalculatorTemplate"
],
function(
    _,
    TP,
    Backbone,
    TabbedLayout,
    OverlayBoxView,
    ZoneCalculators,
    heartRateZonesCalculatorTemplate
)
{

    var CalculatorTabView = TP.ItemView.extend({

        template: {
            type: "handlebars",
            template: heartRateZonesCalculatorTemplate
        },

        serializeData: function()
        {

            var data = this.model.toJSON();

            var calculators = _.filter(ZoneCalculators.heartRate, function(zoneCalculator)
            {
                return zoneCalculator.type === this.zoneCalculatorType;
            }, this);

            data.calculators = _.sortBy(calculators, "label");

            return data;
        }

    });

    var  LactateThresholdTabView = CalculatorTabView.extend({
        zoneCalculatorType: ZoneCalculators.heartRateTypes.LactateThreshold
    });

    var  MaximumHeartRateTabView = CalculatorTabView.extend({
        zoneCalculatorType: ZoneCalculators.heartRateTypes.MaximumHeartRate
    });

    var  MaximumAndRestingHeartRateTabView = CalculatorTabView.extend({
         zoneCalculatorType: ZoneCalculators.heartRateTypes.MaxAndRestingHeartRate       
    });

    var LactateThresholdAndMaximumHeartRateTabView = CalculatorTabView.extend({
         zoneCalculatorType: ZoneCalculators.heartRateTypes.LTAndMaxHeartRate
    });

    var HeartRateZonesCalculatorView = TabbedLayout.extend({

        initialize: function()
        {
            this._initializeNavigation();
        },

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

    return OverlayBoxView.extend({
        className: "heartRateZonesCalculator",
        itemView: HeartRateZonesCalculatorView
    });

});
