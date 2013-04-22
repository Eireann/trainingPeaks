define(
[
    "handlebars",
    "utilities/calculations",
    "hbs!templates/views/weekSummary/weekSummaryBarGraph"
],
function(Handlebars, calculations, weekSummaryBarGraphTemplate)
{
    var displayWeekSummaryBarGraph = function(plannedValue, completedValue, completedDays, cssGraphClass)
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
        } else if(plannedValue)
        {
            context.completedWidthPercent = calculations.calculatePercentComplete(completedValue, plannedValue);
        } else
        {
            context.completedWidthPercent = calculations.calculatePercentComplete(completedDays, 7);
        }

        return weekSummaryBarGraphTemplate(context);
    };

    Handlebars.registerHelper("weekSummaryBarGraph", displayWeekSummaryBarGraph);
    return displayWeekSummaryBarGraph;
});