define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/zoneEntryView",
    "hbs!shared/templates/userSettings/speedPaceZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    ZoneEntryView,
    speedPaceZonesTemplate
)
{

    var SpeedPaceZonesView = TP.CompositeView.extend({

        template:
        {
            type: "handlebars",
            template: speedPaceZonesTemplate
        },

        itemView: ZoneEntryView,

        events:
        {
            "change [name='units']": "_changeUnits"
        },

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']"
            });
        },

        initialize: function()
        {
            this.collection = new TP.Collection(this.model.get("zones"));
        },

        formatValue: function(vaule)
        {
            var options = { defaultValue: "", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.$("[name='units]").val(), value, options);
        },

        _changeUnits: function()
        {
        }

    });

    return SpeedPaceZonesView;

});

