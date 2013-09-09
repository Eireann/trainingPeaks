define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/zoneEntryView",
    "hbs!shared/templates/userSettings/powerZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    ZoneEntryView,
    powerZonesTemplate
)
{

    var PowerZonesView = TP.CompositeView.extend({

        template:
        {
            type: "handlebars",
            template: powerZonesTemplate
        },

        itemView: ZoneEntryView,

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']"
            });
        },

        initialize: function()
        {
            this.collection = new TP.Collection(this.model.get("zones"));
        }

    });

    return PowerZonesView;

});

