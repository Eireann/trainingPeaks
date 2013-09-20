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
    function formatMetricValue(details, displayUnits)
    {
        return TP.utils.metrics.formatValueFor(details, { displayUnits: displayUnits });
    }

    Handlebars.registerHelper(
        "formatMetricValue",
        formatMetricValue
    );

    return formatMetricValue;
});

