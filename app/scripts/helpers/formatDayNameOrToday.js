define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    
    var today = moment().format(TP.utils.datetime.shortDateFormat);
    var tomorrow = moment(today).add("days", 1).format(TP.utils.datetime.shortDateFormat);
    var yesterday = moment(today).subtract("days", 1).format(TP.utils.datetime.shortDateFormat);

    function formatDayNameOrToday(date)
    {
        var formattedDate = moment(date).format(TP.utils.datetime.shortDateFormat);

        if (formattedDate === today)
        {
            return "Today";
        }
        else if (formattedDate === tomorrow)
        {
            return "Tomorrow";
        }
        else if (formattedDate === yesterday)
        {
            return "Yesterday";
        }
        else
        {
            return moment(date).format("dddd");
        }
    }

    Handlebars.registerHelper("formatDayNameOrToday", formatDayNameOrToday);
    return formatDayNameOrToday;
});