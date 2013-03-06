define(
[],
function()
{
    var convertTimeHoursToDecimal = function(timeString)
    {
        var parts = timeString.split(":");
        while (parts.length < 3)
        {
            parts.push("0");
        }

        for (var i = 0; i < parts.length; i++)
        {
            parts[i] = isNaN(Number(parts[i])) ? 0 : Number(parts[i]);
        }

        var hours = parts[0];
        hours += parts[1] / 60;
        hours += parts[2] / 3600;

        return hours;
    };

    return convertTimeHoursToDecimal;
});