define(
[
    "underscore",
    "TP",
    "quickview/metric/views/metricQVItemView"
],
function(
    _,
    TP,
    MetricQVItemView
)
{

    var MetricQVBodyView = TP.CollectionView.extend({

        itemView: MetricQVItemView,

        className: "metricQVBody",

        modelEvents: {},

        initialize: function()
        {
            var types = _.pluck(theMarsApp.user.getMetricsSettings().get("metricTypes"), "type");

            var details = _.map(types, function(type) { return { type: type }; });

            _.each(this.model.get("details"), function(data)
            {
                var detail =  _.find(details, function(detail) { return detail.type === data.type; });
                if(detail)
                {
                    _.extend(detail, data);
                }
                else
                {
                    details.push(data);
                }
            });

            // Move notes to end of details
            details = _.sortBy(details, function(detail) { return detail.type === 12; });

            this.collection = new TP.Collection(details,
            {
                model: TP.DeepModel
            });
            this.listenTo(this.collection, "change", _.bind(this.persistToModel, this));
        },

        persistToModel: function()
        {
            var details = this.model.get("details");
            var detailsByType = {};
            _.each(details, function(detail)
            {
                detailsByType[detail.type] = detail;
            });

            this.collection.each(function(model)
            {
                var value = model.get("value"), type = model.get("type");
                if(TP.utils.metrics.isBlank(value))
                {
                    delete detailsByType[type];
                }
                else
                {
                    detailsByType[type] = model.attributes;
                }
            });

            this.model.set("details", _.values(detailsByType));
        }

    });

    return MetricQVBodyView;

});
