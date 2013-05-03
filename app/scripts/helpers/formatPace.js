define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatPace", TP.utils.conversion.formatPace);
    return TP.utils.conversion.formatPace;
});