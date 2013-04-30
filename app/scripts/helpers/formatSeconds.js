define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatSeconds", TP.utils.datetime.format.decimalSecondsAsTime);
    return TP.utils.datetime.format.decimalSecondsAsTime;
});