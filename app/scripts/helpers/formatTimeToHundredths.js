define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{

    var formatTimeToHundredths = function(hours, handlebarsContext)
    {
        return TP.utils.datetime.formatter.decimalHoursAsTime(hours, true, undefined, true);
    };

    Handlebars.registerHelper("formatTimeToHundredths", formatTimeToHundredths);
    return formatTimeToHundredths;
});