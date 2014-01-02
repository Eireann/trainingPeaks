define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatSeconds", TP.utils.datetime.formatter.decimalSecondsAsTime);
    return TP.utils.datetime.formatter.decimalSecondsAsTime;
});