define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/zoneEntryView"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    ZoneEntryView
)
{

    var ZonesTypeView = TP.CompositeView.extend({

        itemView: ZoneEntryView,

        modelEvents: {},

        _applyZoneSetDataOnRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                formatters: this.getFormatters()
            });
        },

        constructor: function(options)
        {
            this.collection = new TP.Collection(options.model.get("zones"));
            ZonesTypeView.__super__.constructor.apply(this, arguments);
            this.on("render", this._applyZoneSetDataOnRender, this);
        },

        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModels");
            this.model.set("zones", this.collection.toJSON());
            FormUtility.applyValuesToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                parsers: this.getParsers()
            });
        },

        getFormatters: function()
        {
            return {};
        },

        getParsers: function()
        {
            return {};
        }

    });

    return ZonesTypeView;

});



