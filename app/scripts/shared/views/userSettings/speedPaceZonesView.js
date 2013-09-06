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
            "change [name=units]": "_changeUnits"
        },

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']"
            });
            this._changeUnits();
        },

        initialize: function()
        {
            this.collection = new TP.Collection(this.model.get("zones"));
            this.on("before:item:added", this._addedItems, this);
        },

        formatValue: function(value)
        {
            var options = { defaultValue: "", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.$("[name=units]:checked").val(), value, options);
        },

        _changeUnits: function()
        {
            this.children.call("render");
        },

        _addedItems: function(view)
        {
            view.setFormatter(_.bind(this.formatValue, this));
        }

    });

    return SpeedPaceZonesView;

});

