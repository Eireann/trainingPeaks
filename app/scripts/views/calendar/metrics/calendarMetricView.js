define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var CalendarMetricView = TP.ItemView.extend({

        template: _.template("METRIC!!!!")

    });

    return CalendarMetricView;
});
