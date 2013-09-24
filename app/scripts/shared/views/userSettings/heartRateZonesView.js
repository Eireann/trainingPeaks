define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesConfigGroupView",
    "shared/views/userSettings/heartRateZonesCalculatorView",
    "hbs!shared/templates/userSettings/heartRateZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesConfigGroupView,
    HeartRateZonesCalculatorView,
    heartRateZonesTemplate
)
{

    var PowerZonesView = ZonesConfigGroupView.extend({

        ZonesCalculatorView: HeartRateZonesCalculatorView,

        template:
        {
            type: "handlebars",
            template: heartRateZonesTemplate
        },
        
        formatValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue("heartrate", value, options);
        },

        parseValue: function(value)
        {
            var options = { workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue("number", value, options);
        }

    });

    return PowerZonesView;

});


