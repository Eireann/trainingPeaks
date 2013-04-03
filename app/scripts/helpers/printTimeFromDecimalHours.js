define(
[
    "handlebars",
    "utilities/printTimeFromDecimalHours"
],
function(Handlebars, printTimeFromDecimalHours, showSeconds)
{
    Handlebars.registerHelper("printTimeFromDecimalHours", printTimeFromDecimalHours, showSeconds);
    return printTimeFromDecimalHours;
});