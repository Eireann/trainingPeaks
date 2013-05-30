define(
[
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(conversion, getKeyStatField)
{
    function formatPeakTime(interval)
    {
        var minutes, hours, seconds;

        if (interval < 60)
        {
            return interval + " sec";
        } else if (interval >= 3600)
        {
            hours = Math.floor(interval / 3600);
            minutes = Math.round((interval % 3600) / 60);

            if (hours < 10)
                hours = "0" + hours;

            if (minutes < 10)
                minutes = "0" + minutes;

            return hours + ":" + minutes + " h";
        } else 
        {
            minutes = Math.floor(interval / 60);
            seconds = interval % 60;
            if (seconds < 10)
                seconds = "0" + seconds;

            if (minutes < 10)
                minutes = "0" + minutes;

            return minutes + ":" + seconds + " min";
        }
    }

    return formatPeakTime;
});