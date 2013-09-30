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

        onRender: function()
        {
            if(!this._isSupportedMetric()) return;

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

        formatMetric: function()
        {
            return TP.utils.metrics.formatValueFor(this.model.attributes);
        },

        parseMetric: function(value)
        {
            return TP.utils.metrics.parseValueFor(this.model.attributes, value);
        },

        _isSupportedMetric: function()
        {
            return _.contains([9], this.model.get("type"));
        },

        serializeData: function()
        {
            var data = MetricQVItemView.__super__.serializeData.apply(this, arguments);
            data.supported = this._isSupportedMetric();
            return data;
        }

    });

    return MetricQVItemView;

});

