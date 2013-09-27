define(
[
    "underscore",
    "moment",
    "TP",
    "quickview/views/qvShellView"
],
function(
    _,
    moment,
    TP,
    QVShellView
)
{

    var MetricQuickView = QVShellView.extend({

        serializeData: function()
        {
            var data = MetricQuickView.__super__.serializeData.apply(this, arguments);

            data.activityTimestamp = this.model.get("timeStamp");

            return data;
        }

    });

    return MetricQuickView;

});
