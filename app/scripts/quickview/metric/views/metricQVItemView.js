define(
[
    "setImmediate",
    "underscore",
    "TP",
    "shared/utilities/formUtility",
    "hbs!quickview/metric/templates/metricQVItemTemplate"
],
function(
    setImmediate,
    _,
    TP,
    FormUtility,
    metricQVItemTemplate
)
{

    var MetricQVItemView = TP.ItemView.extend({

        className: function()
        {
            return "metricQVItem metricType-" + this.model.get("type");
        },

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
                    metric: _.bind(this.formatMetric, this, null),
                    metric0: _.bind(this.formatMetric, this, 0),
                    metric1: _.bind(this.formatMetric, this, 1),
                },

                parsers:
                {
                    metric: _.bind(this.parseMetric, this, null),
                    metric0: _.bind(this.parseMetric, this, 0),
                    metric1: _.bind(this.parseMetric, this, 1)
                }
            });

        },

        formatMetric: function(index, value)
        {
            return TP.utils.metrics.formatValueFor(this._metricDetails(index), { value: value });
        },

        parseMetric: function(index, value)
        {
            return TP.utils.metrics.parseValueFor(this._metricDetails(index), value);
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
        },

        _metricDetails: function(index)
        {
            var details = this.model.attributes;
            if(!_.isNull(index) && !_.isUndefined(index))
            {
                details = _.extend({ index: index }, details);
            }
            return details;
        }

    });

    return MetricQVItemView;

});

