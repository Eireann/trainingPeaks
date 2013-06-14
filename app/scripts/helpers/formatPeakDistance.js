define(
[
    "handlebars",
    "utilities/workout/formatPeakDistance"
],
function(Handlebars, formatPeakDistance)
{
    Handlebars.registerHelper("formatPeakDistance", formatPeakDistance);
    return formatPeakDistance;
});