define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("getUnitsLabel", TP.utils.units.getUnitsLabel);
    return TP.utils.units.getUnitsLabel;
});