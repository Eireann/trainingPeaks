define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatUnitsValue", TP.utils.conversion.formatUnitsValue);
    return TP.utils.conversion.formatUnitsValue;
});