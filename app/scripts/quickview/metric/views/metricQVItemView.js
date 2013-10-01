define(
[
    "underscore",
    "TP",
    "shared/utilities/formUtility",
    "hbs!quickview/metric/templates/metricQVItemTemplate"
],
function(
    _,
    TP,
    FormUtility,
    metricQVItemTemplate
)
{

    var MetricQVItemView = TP.ItemView.extend({

        className: "metricQVItem",

        template:
        {
            type: "handlebars",
            template: metricQVItemTemplate
        },

        modelEvents: {},

        initialize: function()
        {
            var info = TP.utils.metrics.infoFor(this.model.attributes);
            if(info.subMetrics && !_.isArray(this.model.get("value")))
            {
                this.model.set("value", []);
            }
        },

        onRender: function()
        {
            FormUtility.bindFormToModel(this.$el, this.model,
            {
                formatters:
                {
                    metric: _.bind(this.formatMetric, this)
                },

                parsers:
                {
                    metric: _.bind(this.parseMetric, this)
                }
            });
        },

        formatMetric: function(value)
        {
            return TP.utils.metrics.formatValueFor(this.model.attributes, { value: value });
        },

        parseMetric: function(value)
        {
            return TP.utils.metrics.parseValueFor(this.model.attributes, value);
        },

        serializeData: function()
        {
            var data = MetricQVItemView.__super__.serializeData.apply(this, arguments);
            data.info = TP.utils.metrics.infoFor(this.model.attributes);
            data.special = {};
            switch(data.info.id)
            {
                case 1:
                    data.special.bloodPressure = true;
                    break;
                case 12:
                    data.special.note = true;
                    break;
                case 45:
                    data.special.insulin = true;
                    break;
                default:
                    data.special = false;
            }

            return data;
        }

    });

    return MetricQVItemView;

});

