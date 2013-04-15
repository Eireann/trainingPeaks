define(
[
    "handlebars",
    "utilities/calculations",
    "hbs!templates/views/weekSummaryBarGraph"
],
function(Handlebars, calculations, weekSummaryBarGraphTemplate)
{
    var displayWeekSummaryBarGraph = function(plannedValue, completedValue, cssGraphClass)
    {
        var context = {
            cssGraphClass: cssGraphClass,
            plannedValue: plannedValue,
            completedValue: completedValue,
            plannedWidthPercent: 100,
            completedMoreThanPlanned: false
        };

        if (plannedValue && completedValue > plannedValue)
        {
            context.completedWidthPercent = 100;
            context.plannedWidthPercent = calculations.calculatePercentComplete(plannedValue, completedValue);
            context.completedMoreThanPlanned = true;
        } else
        {
            context.completedWidthPercent = calculations.calculatePercentComplete(completedValue, plannedValue);
        }

        return weekSummaryBarGraphTemplate(context);
    };

    Handlebars.registerHelper("weekSummaryBarGraph", displayWeekSummaryBarGraph);
    return displayWeekSummaryBarGraph;
});