define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatTime", TP.utils.datetime.formatter.decimalHoursAsTime);
    return TP.utils.datetime.formatter.decimalHoursAsTime;
});