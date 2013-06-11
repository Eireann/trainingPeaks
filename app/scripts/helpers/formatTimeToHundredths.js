define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{

    var formatTimeToHundredths = function(hours, handlebarsContext)
    {
        return TP.utils.datetime.format.decimalHoursAsTime(hours, true, undefined, true);
    };

    Handlebars.registerHelper("formatTimeToHundredths", formatTimeToHundredths);
    return formatTimeToHundredths;
});