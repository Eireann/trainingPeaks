define(
[
    "utilities/conversion/conversion",
    "utilities/workout/getKeyStatField"
],
function(conversion, getKeyStatField)
{
    function formatPeakTime(interval)
    {
        if (interval < 90 || (interval % 60) !== 0)
        {
            return interval + " sec";
        } else if (interval > 3600)
        {
            var hours = Math.floor(interval / 3600);
            var minutes = Math.round((interval % 3600) / 60);

            if (hours < 10)
                hours = "0" + hours;

            if (minutes < 10)
                minutes = "0" + minutes;

            return hours + ":" + minutes + " h";
        } else 
        {
            var minutes = Math.floor(interval / 60);
            var seconds = interval % 60;
            if (seconds < 10)
                seconds = "0" + seconds;

            if (minutes < 10)
                minutes = "0" + minutes;

            return minutes + ":" + seconds + " min";
        }
    }

    return formatPeakTime;
});