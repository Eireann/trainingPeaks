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
            var info = TP.utils.metrics.infoFor(this.model.attributes);
            if(info.hasOwnProperty("subMetrics")) return false;
            if(info.hasOwnProperty("chartable") && !info.chartable) return false;
            return true;
        },

        serializeData: function()
        {
            var data = MetricQVItemView.__super__.serializeData.apply(this, arguments);
            data.info = TP.utils.metrics.infoFor(this.model.attributes);
            data.supported = this._isSupportedMetric();
            return data;
        }

    });

    return MetricQVItemView;

});

