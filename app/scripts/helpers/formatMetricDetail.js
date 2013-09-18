define(
[
    "handlebars",
    "TP"
],
function(
    Handlebars,
    TP
)
{
    function formatMetricDetail(details, displayUnits)
    {
        return TP.utils.metrics.labelFor(details) + ": " + TP.utils.metrics.formatValueFor(details, { displayUnits: displayUnits });
    }

    Handlebars.registerHelper(
        "formatMetricDetail",
        formatMetricDetail
    );

    return formatMetricDetail;
});
