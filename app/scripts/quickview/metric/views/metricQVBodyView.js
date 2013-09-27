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

        initialize: function()
        {
            var types = [9];

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

            this.collection = new TP.Collection(details);
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
                detailsByType[model.get("type")] = model.attributes;
            });

            this.model.set("details", _.values(detailsByType));
        }

    });

    return MetricQVBodyView;

});
