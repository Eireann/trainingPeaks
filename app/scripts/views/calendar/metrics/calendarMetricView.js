define(
[
    "underscore",
    "TP",
    "hbs!templates/views/calendar/metric/calendarMetric"
],
function(
    _,
    TP,
    calendarMetricTemplate
)
{

    var CalendarMetricView = TP.ItemView.extend({

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: calendarMetricTemplate
        }

    });

    return CalendarMetricView;
});
