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

        className: "zoneEntry",

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
            this.bindFormValuesToModels();
        },

        bindFormValuesToModels: function()
        {
            FormUtility.bindFormToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']",
                parsers:
                {
                    zoneValue: this.parser
                },
                formatters:
                {
                    zoneValue: this.formatter
                }
            });
        },

        applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']",
                formatters:
                {
                    zoneValue: this.formatter
                }
            });
        },

        formatter: function(value)
        {
            return Number(value || 0).toString();
        },

        parser: function(value)
        {
            return parseFloat(value);
        },

        setFormatter: function(formatter)
        {
            this.formatter = formatter;
            this.applyModelValuesToForm();
        },

        setParser: function(parser)
        {
            this.parser = parser;
        },

        _remove: function()
        {
            this.model.destroy();
        }

    });

    return ZoneEntryView;

});
