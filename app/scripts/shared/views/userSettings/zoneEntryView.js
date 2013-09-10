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

        events:
        {
            "click .removeZone": "_remove"
        },

        attributes: function()
        {
            return {
                "data-mcid": this.model.cid
            };
        },

        onRender: function()
        {
            this._updateFields();
        },

        applyFormValuesToModels: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']",
                parsers:
                {
                    zoneValue: this.parser
                }
            });
        },

        formatter: function(value)
        {
            return value;
        },

        parser: function(value)
        {
            return parseFloat(value);
        },

        setFormatter: function(formatter)
        {
            this.formatter = formatter;
            this._updateFields();
        },

        setParser: function(parser)
        {
            this.parser = parser;
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
        },

        _remove: function()
        {
            this.model.destroy();
        }

    });

    return ZoneEntryView;

});

