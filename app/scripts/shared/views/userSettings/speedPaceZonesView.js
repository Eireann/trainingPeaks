define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesTypeView",
    "hbs!shared/templates/userSettings/speedPaceZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesTypeView,
    speedPaceZonesTemplate
)
{

    var SpeedPaceZonesView = ZonesTypeView.extend({

        template:
        {
            type: "handlebars",
            template: speedPaceZonesTemplate
        },

        events:
        {
            "change [name=units]": "_changeUnits"
        },

        onRender: function()
        {
            this._changeUnits();
        },

        initialize: function()
        {
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

