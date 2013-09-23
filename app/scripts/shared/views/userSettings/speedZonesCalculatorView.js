define(
[
    "underscore",
    "TP",
    "shared/views/overlayBoxView",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/zoneCalculatorViews",
    "hbs!shared/templates/userSettings/speedZonesCalculatorItemTemplate",
    "hbs!shared/templates/userSettings/speedZonesCalculatorTemplate"
],
function(
    _,
    TP,
    OverlayBoxView,
    ZoneCalculatorDefinitions,
    ZoneCalculator,
    ZoneCalculatorViews,
    speedZoneTemplate,
    speedZonesCalculatorTemplate
    )
{

    function filterCalculators(type)
    {
        return _.filter(ZoneCalculatorDefinitions.speed, function(zoneCalculator) {
            return zoneCalculator.type === type; 
        });
    }

    var SpeedZoneCalculatorTabView = ZoneCalculatorViews.TabContentView.extend({

        zoneTypesById: ZoneCalculatorDefinitions.speedById,

        zoneCalculator: ZoneCalculator.Speed,

        calculators: ZoneCalculatorDefinitions.speed,

        inputs: [ "threshold" ],

        units: "speed",

        itemView: TP.ItemView.extend({
            template: {
                type: "handlebars",
                template: speedZoneTemplate
            }
        }),

        template: {
            type: "handlebars",
            template: speedZonesCalculatorTemplate
        }

    });

    var ThresholdSpeedTabView = SpeedZoneCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.Threshold),
        inputs: [ "threshold" ]
    });

    var DistanceTimeTabView = SpeedZoneCalculatorTabView.extend({

        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.DistanceTime),

        inputs: ["testDistance", "speed"],


        clickZoneCalculator: function(e)
        {
            this.collection.reset();
            this._selectZoneCalculator(e);
            this._highlightSelectedZone(e);
            this._setDistanceOptions();
            this._enableCalculate();
        },

        _showInputs: function()
        {
            _.each(this.inputs, function(inputClass)
            {
                this.$("." + inputClass).removeClass("disabled");
            }, this);

            var self = this;
            setImmediate(function ()
            {
                self.$("select[name=testDistance]").selectBoxIt();
                self._setDistanceOptions();
            });
        },

        _setDistanceOptions: function()
        {
            if(this.calculatorDefinition)
            {
                if(!this.model.get("testDistance"))
                {
                    this.model.set("testDistance", this.calculatorDefinition.distances[0].id);
                }

                var $select = this.$("select[name=testDistance]"); 
                $select.empty();
                _.each(this.calculatorDefinition.distances, function(distance)
                {
                    var $option = $("<option>").val(distance.id).text(distance.label);
                    $select.append($option);
                });

                $select.selectBoxIt("refresh");

                this._applyModelValuesToForm();
            }
        }

    });

    var HundredMeterTimeTabView = SpeedZoneCalculatorTabView.extend({

        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.SecondsPer100m),

        inputs: ["secondsPer100m"],

        initialize: function()
        {
            this.model.set("testDistance", ZoneCalculatorDefinitions.speedDistances.OneHundredMeters.id);
            this.calculatorDefinition = ZoneCalculatorDefinitions.speed.CTSFromSecondsPer100m;
        }
    });

    var SpeedZonesCalculatorTabbedLayout = ZoneCalculatorViews.TabbedLayout.extend({

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Threshold Speed",
                    view: ThresholdSpeedTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Distance / Time",
                    view: DistanceTimeTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Seconds / 100m",
                    view: HundredMeterTimeTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                }
            ];
        }

    });

    return OverlayBoxView.extend({

        className: "speedZonesCalculator zonesCalculator",

        itemView: SpeedZonesCalculatorTabbedLayout
    });

});
