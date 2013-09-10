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

        _applyZoneSetDataOnRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']"
            });
        },

        constructor: function(options)
        {
            this.collection = new TP.Collection(options.model.get("zones"));
            ZonesTypeView.__super__.constructor.apply(this, arguments);
            this.on("render", this._applyZoneSetDataOnRender, this);
        }

    });

    return ZonesTypeView;

});



