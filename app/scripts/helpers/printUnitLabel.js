define(
[
    "handlebars",
    "utilities/printUnitLabel"
],
function(Handlebars, printUnitLabel)
{
    Handlebars.registerHelper("printUnitLabel", printUnitLabel);
    return printUnitLabel;
});