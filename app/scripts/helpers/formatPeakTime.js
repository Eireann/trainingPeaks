define(
[
    "handlebars",
    "utilities/workout/formatPeakTime"
],
function(Handlebars, formatPeakTime)
{
    Handlebars.registerHelper("formatPeakTime", formatPeakTime);
    return formatPeakTime;
});