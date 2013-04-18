define(
[
    "utilities/datetime/format",
    "utilities/datetime/convert"
], function(format, convert)
{
    return {

        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        format: format,
        convert: convert,

        isThisWeek: function(dateToCheck)
        {
            var today = moment();
            var weekDate = moment(dateToCheck);
            return weekDate.isoWeek() === today.isoWeek() && weekDate.year() === today.year();
        }
    };
});