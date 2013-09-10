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
            this.units = this.$("[name=units]:checked").val();
            this._changeUnits();
        },

        initialize: function()
        {
            this.units = "speed";
            this.on("before:item:added", this._addedItems, this);
        },

        formatValue: function(value)
        {
            var options = { defaultValue: "", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.units, value, options);
        },

        parseValue: function(value)
        {
            var options = { defaultValue: "", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue(this.units, value, options);
        },

        getFormatters: function()
        {
            return {
                zoneValue: _.bind(this.formatValue, this)
            };
        },

        getParsers: function()
        {
            return {
                zoneValue: _.bind(this.parseValue, this)
            };
        },

        _changeUnits: function()
        {
            this.applyFormValuesToModels();
            this.units = this.$("[name=units]:checked").val();
            this._applyZoneSetDataOnRender();
            this.children.call("render");
        },

        _addedItems: function(view)
        {
            view.setFormatter(_.bind(this.formatValue, this));
            view.setParser(_.bind(this.parseValue, this));
        }

    });

    return SpeedPaceZonesView;

});

