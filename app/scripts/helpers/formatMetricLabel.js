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
    function formatMetricLabel(details)
    {
        return TP.utils.metrics.labelFor(details);
    }

    Handlebars.registerHelper(
        "formatMetricLabel",
        formatMetricLabel
    );

    return formatMetricLabel;
});

