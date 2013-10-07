define(
[
    "underscore",
    "TP",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/zoneCalculatorViews",
    "hbs!shared/templates/userSettings/powerZonesCalculatorItemTemplate",
    "hbs!shared/templates/userSettings/powerZonesCalculatorTemplate"
],
function(
    _,
    TP,
    ZoneCalculatorDefinitions,
    ZoneCalculator,
    ZoneCalculatorViews,
    powerZoneTemplate,
    powerZonesCalculatorTemplate
    )
{

    var PowerThresholdTabView = ZoneCalculatorViews.TabContentView.extend({

        zoneTypesById: ZoneCalculatorDefinitions.powerById,

        zoneCalculator: ZoneCalculator.Power,

        calculators: _.values(ZoneCalculatorDefinitions.power),

        inputs: [ "threshold", "testResult" ],

        units: "power",

        zoneItemView: TP.ItemView.extend({
            template: {
                type: "handlebars",
                template: powerZoneTemplate
            }
        }),

        template: {
            type: "handlebars",
            template: powerZonesCalculatorTemplate
        },

        initialize: function(options)
        {
            ZoneCalculatorViews.TabContentView.prototype.initialize.apply(this, arguments);
            this.on("selectZoneCalculator", this._enableTestResultOrThreshold, this);
        },

        _getInitialEnabledInputs: function()
        {
            return this._getRequiredInputs();
        },

        _enableTestResultOrThreshold: function()
        {
            if(this.calculatorDefinition === ZoneCalculatorDefinitions.power.CharmichaelTrainingSystemsZone)
            {
                this.$(".threshold").addClass("disabled");
                this.$(".testResult").removeClass("disabled");
            }
            else
            {
                this.$(".threshold").removeClass("disabled");
                this.$(".testResult").addClass("disabled");
            }
        },

        _applyFormValuesToModel: function()
        {
            ZoneCalculatorViews.TabContentView.prototype._applyFormValuesToModel.call(this);
            if(this.model.get("testResult"))
            {
                this.model.set("threshold", this.model.get("testResult"));
            }
        },

        _getRequiredInputs: function()
        {
            if(this.calculatorDefinition === ZoneCalculatorDefinitions.power.CharmichaelTrainingSystemsZone)
            {
                return ["testResult"];
            }
            else
            {
                return ["threshold"];
            }
        }

    });

    var EmptyPowerTabView = PowerThresholdTabView.extend({
        calculators: [],
        inputs: []
    });


    var PowerZonesCalculatorTabbedLayout = ZoneCalculatorViews.TabbedLayout.extend({

        className: "tabbedLayout zonesCalculator powerZonesCalculator",

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Choose Type",
                    view: EmptyPowerTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }
                },
                {
                    title: "Threshold Power",
                    view: PowerThresholdTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }
                }
            ];
        }

    });

    return PowerZonesCalculatorTabbedLayout;

});
