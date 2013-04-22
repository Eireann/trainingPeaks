define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("printTimeFromDecimalHours", TP.utils.datetime.format.decimalHoursAsTime);
    return TP.utils.datetime.format.decimalHoursAsTime;
});