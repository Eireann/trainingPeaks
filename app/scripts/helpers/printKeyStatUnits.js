define(
[
    "handlebars",
    "utilities/printKeyStatUnits"
],
function (Handlebars, printKeyStatUnits)
{
    Handlebars.registerHelper("printKeyStatUnits", printKeyStatUnits);
    return printKeyStatUnits;
});