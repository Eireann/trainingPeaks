define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesTypeView",
    "hbs!shared/templates/userSettings/powerZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesTypeView,
    powerZonesTemplate
)
{

    var PowerZonesView = ZonesTypeView.extend({

        template:
        {
            type: "handlebars",
            template: powerZonesTemplate
        },

        formatValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue("power", value, options);
        },

        parseValue: function(value)
        {
            var options = { workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue("power", value, options);
        }

    });

    return PowerZonesView;

});

