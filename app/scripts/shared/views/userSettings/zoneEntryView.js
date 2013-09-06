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
            this._updateFields();
        },

        formatter: function(value)
        {
            return value;
        },

        setFormatter: function(formatter)
        {
            this.formatter = formatter;
            this._updateFields();
        },

        _updateFields: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']",
                formatters:
                {
                    zoneValue: this.formatter
                }
            });
        }

    });

    return ZoneEntryView;

});

