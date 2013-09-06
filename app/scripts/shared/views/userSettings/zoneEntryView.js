define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettings/zoneEntryTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    zoneEntryTemplate
)
{
    var ZoneEntryView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: zoneEntryTemplate
        },

        modelEvents: {},
        collectionEvents: {},

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']"
            });
        }

    });

    return ZoneEntryView;

});

