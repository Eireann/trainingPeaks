define(
[
    "underscore",
    "moment",
    "TP",
    "quickview/views/qvShellView",
    "quickview/metric/views/metricQVBodyView"
],
function(
    _,
    moment,
    TP,
    QVShellView,
    MetricQVBodyView
)
{

    var MetricQuickView = QVShellView.extend({

        modelEvents: {},

        serializeData: function()
        {
            var data = MetricQuickView.__super__.serializeData.apply(this, arguments);

            data.activityTimestamp = this.model.get("timeStamp");

            return data;
        },

        bodyView: MetricQVBodyView

    });

    return MetricQuickView;

});
