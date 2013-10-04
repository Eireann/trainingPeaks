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
    function formatMetricUnits(details, displayUnits)
    {
        return TP.utils.metrics.formatUnitsFor(details);
    }

    Handlebars.registerHelper(
        "formatMetricUnits",
        formatMetricUnits
    );

    return formatMetricUnits;
});


