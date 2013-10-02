define(
[
    "underscore",
    "moment",
    "TP",
    "quickview/views/qvShellView",
    "quickview/metric/views/metricQVBodyView",
    "quickview/metric/views/metricQVBarView"
],
function(
    _,
    moment,
    TP,
    QVShellView,
    MetricQVBodyView,
    MetricQVBarView
)
{

    var MetricQuickView = QVShellView.extend({

        className: QVShellView.prototype.className + " metricQuickView",

        modelEvents: {},

        serializeData: function()
        {
            var data = MetricQuickView.__super__.serializeData.apply(this, arguments);

            data.activityTimestamp = this.model.get("timeStamp");

            return data;
        },

        bodyView: MetricQVBodyView,
        barView: MetricQVBarView

    });

    return MetricQuickView;

});
