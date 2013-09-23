define(
[
    "underscore",
    "TP",
    "shared/views/overlayBoxView",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/zoneCalculatorViews",
    "hbs!shared/templates/userSettings/powerZonesCalculatorItemTemplate",
    "hbs!shared/templates/userSettings/powerZonesCalculatorTemplate"
],
function(
    _,
    TP,
    OverlayBoxView,
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

        calculators: ZoneCalculatorDefinitions.power,

        inputs: [ "threshold" ],

        units: "power",

        itemView: TP.ItemView.extend({
            template: {
                type: "handlebars",
                template: powerZoneTemplate
            }
        }),

        template: {
            type: "handlebars",
            template: powerZonesCalculatorTemplate
        }

    });


    var PowerZonesCalculatorTabbedLayout = ZoneCalculatorViews.TabbedLayout.extend({

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Threshold Power",
                    view: PowerThresholdTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                }
            ];
        }

    });

    return OverlayBoxView.extend({

        className: "powerZonesCalculator zonesCalculator",

        itemView: PowerZonesCalculatorTabbedLayout
    });

});
