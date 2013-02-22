define(
[
    "handlebars"
],
function(Handlebars)
{
    var printTimeFromDecimalHours = function(hours)
    {
        var fullHours = Math.floor(hours);
        var partialHours = hours % 1;
        var minutes = partialHours * 60;

        var time;

        if (fullHours < 10)
            time = "0" + fullHours;
        else
            time = "" + fullHours;

        if (minutes > 10)
            time += ":0" + minutes;
        else
            time += ":" + minutes;

        return time;
    };

    Handlebars.registerHelper("printTimeFromDecimalHours", printTimeFromDecimalHours);
    return printTimeFromDecimalHours;
});