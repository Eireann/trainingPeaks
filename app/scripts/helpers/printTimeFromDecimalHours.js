define(
[
    "handlebars",
    "utilities/printTimeFromDecimalHours"
],
function(Handlebars, printTimeFromDecimalHours)
{
    Handlebars.registerHelper("printTimeFromDecimalHours", printTimeFromDecimalHours);
    return printTimeFromDecimalHours;
});