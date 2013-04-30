define(
[
    "underscore",
    "moment"
],
function(_, moment)
{
    // TP.utils.datetime.format() ...
    var format = function(momentParseableDate, formatString)
    {
        var momentDate = moment(momentParseableDate);
        if (!formatString || typeof formatString !== "string")
        {
            if (momentDate.dayOfYear() === 1) // firstday of year
                formatString = "MMM DD YYYY";
            else if (momentDate.date() === 1) // firstday of month
                formatString = "MMM DD";
            else
                formatString = "DD";
        }

        return momentDate.format(formatString);
    };

    // TP.utils.datetime.format.decimalSecondsAsTime
    format.decimalSecondsAsTime = function(seconds, defaultValueIfEmpty)
    {
        var hours = seconds ? Number(seconds) / 3600 : 0;
        return format.decimalHoursAsTime(hours, true, defaultValueIfEmpty);
    };

    // TP.utils.datetime.format.decimalHoursAsTime
    format.decimalHoursAsTime = function(hours, showSeconds, defaultValueIfEmpty)
    {
        var defaultTime = (showSeconds === true) ? "0:00:00" : "00:00";
        if (_.isNumber(defaultValueIfEmpty) || _.isString(defaultValueIfEmpty))
        {
            defaultTime = defaultValueIfEmpty;
        }

        if (_.isString(hours))
        {
            hours = Number(hours);
        }

        if (typeof showSeconds !== 'boolean')
        {
            showSeconds = true;
        }

        if (!hours || hours <= 0.00001)
        {

            return defaultTime;
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

    return format;
});