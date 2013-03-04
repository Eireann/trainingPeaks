define(
[],
function()
{
    var printTimeFromDecimalHours = function(hours)
    {
        if (!hours || hours <= 0.0166)
            return "00:00";

        var fullHours = Math.floor(hours);
        var partialHours = hours % 1;
        var minutes = partialHours * 60;

        var time;

        if (fullHours < 10)
            time = "0" + fullHours;
        else
            time = "" + fullHours;

        if (minutes > 10)
            time += ":" + minutes;
        else
            time += ":0" + minutes;

        return time;
    };

    return printTimeFromDecimalHours;
});