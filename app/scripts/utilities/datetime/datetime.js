define(
[
    "utilities/datetime/format",
    "utilities/datetime/convert"
], function(format, convert)
{
    return {

        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "THH:mm:ss",
        longDateFormat: "YYYY-MM-DDTHH:mm:ss",

        format: format,
        parse: format.parse,
        convert: convert,

        isThisWeek: function(dateToCheck)
        {
            var today = moment();
            var weekDate = moment(dateToCheck);
            return weekDate.isoWeek() === today.isoWeek() && weekDate.year() === today.year();
        }
    };
});
