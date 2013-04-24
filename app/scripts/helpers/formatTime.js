define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatTime", TP.utils.datetime.format.decimalHoursAsTime);
    return TP.utils.datetime.format.decimalHoursAsTime;
});