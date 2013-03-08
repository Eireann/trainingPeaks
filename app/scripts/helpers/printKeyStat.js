define(
[
    "handlebars",
    "utilities/printKeyStat"
],
function (Handlebars, printKeyStat)
{
    Handlebars.registerHelper("printKeyStat", printKeyStat);
    return printKeyStat;
});