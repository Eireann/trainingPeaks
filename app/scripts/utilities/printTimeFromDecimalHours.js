define(
[
    "underscore"
],
function(_)
{
    var printTimeFromDecimalHours = function(hours, showSeconds, zeroFormatValue)
    {
        if (typeof showSeconds !== 'boolean')
        {
            showSeconds = true;
        }

        if (!hours || hours <= 0.00001)
        {
            if (_.isNumber(zeroFormatValue) || _.isString(zeroFormatValue))
            {
                return zeroFormatValue;
            }
            var displayTime = (showSeconds === true) ? "0:00:00" : "00:00";
            return displayTime;
        }

        var fullHours = Math.floor(hours);
        var exactMinutes = (hours % 1) * 60;
        var exactSeconds = (exactMinutes % 1) * 60;
        var fullMinutes;
        var fullSeconds;

        if (showSeconds === true)
        {
            fullMinutes = Math.floor(exactMinutes);
            fullSeconds = Math.round(exactSeconds);

            // math precision error? 1:20 becomes 1:19:60, 2:40 becomes 2:39:60, etc
            if(fullSeconds === 60)
            {
                fullMinutes += 1;
                fullSeconds = 0;
            }
        }
        else
            fullMinutes = Math.round(exactMinutes);

        var time;

        /*
        if (fullHours < 10)
            time = "0" + fullHours;
        else
            time = "" + fullHours;
            */
        time = "" + fullHours;

        if (fullMinutes >= 10)
            time += ":" + fullMinutes;
        else
            time += ":0" + fullMinutes;
        
        if (showSeconds === true)
        {
            if (fullSeconds >= 10)
                time += ":" + fullSeconds;
            else
                time += ":0" + fullSeconds;

        }

        return time;
    };

    return printTimeFromDecimalHours;
});