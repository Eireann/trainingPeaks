define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesConfigGroupView",
    "shared/views/userSettings/speedZonesCalculatorView",
    "hbs!shared/templates/userSettings/speedPaceZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesConfigGroupView,
    SpeedZonesCalculatorView,
    speedPaceZonesTemplate
)
{

    var SpeedPaceZonesView = ZonesConfigGroupView.extend({

        ZonesCalculatorView: SpeedZonesCalculatorView,

        template:
        {
            type: "handlebars",
            template: speedPaceZonesTemplate
        },

        events:
        _.extend({
            "change [name=units]": "_changeUnits"
        }, ZonesConfigGroupView.prototype.events),

        onRender: function()
        {
            this.units = this.$("[name=units]:checked").val();
            this._changeUnits();
        },

        initialize: function()
        {
            this.units = "pace";
        },

        formatValue: function(value)
        {
            var options = { defaultValue: this.units === "pace" ? "" : "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.units, value, options);
        },

        parseValue: function(value)
        {
            var options = { workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue(this.units, value, options);
        },

        getZonesCalculatorView: function()
        {
            var unitsModel = new TP.Model({ units: this.units });
            var calcView = new this.ZonesCalculatorView({ model: this.model, unitsModel: unitsModel });

            this.on("change:units", function()
            {
                unitsModel.set("units", this.units);
            }, this);

            return calcView;
        },

        _changeUnits: function()
        {
            this.units = this.$("[name=units]:checked").val();
            this.applyModelValuesToForm();
            this.trigger("change:units");
        }

    });

    return SpeedPaceZonesView;

});

