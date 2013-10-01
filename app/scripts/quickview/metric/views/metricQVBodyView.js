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
            var types = _.pluck(theMarsApp.user.getMetricsSettings().attributes, "type");

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
                var value = model.get("value");
                if(!_.isNull(value) && !_.isUndefined(value) && !_.isEmpty(value))
                {
                    detailsByType[model.get("type")] = model.attributes;
                }
            });

            this.model.set("details", _.values(detailsByType));
        }

    });

    return MetricQVBodyView;

});
