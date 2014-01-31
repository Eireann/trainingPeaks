define(
[
    "moment",
    "utilities/datetime/format",
    "utilities/datetime/convert"
], function(moment, DateTimeFormatter, convert)
{

    var formatter = new DateTimeFormatter();

    var datetime = {

        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "THH:mm:ss",
        longDateFormat: "YYYY-MM-DDTHH:mm:ss",

        formatter: formatter,
        
        format: function(momentParseableDate, formatString)
        {
            return formatter.format(momentParseableDate, formatString);
        },

        parse: function(momentParseableDate, parseFormat)
        {
            return formatter.parse(momentParseableDate, parseFormat);
        },

        convert: convert,

        getTodayDate: function()
        {
            return moment().local().startOf("day");
        },

        getThisWeekStartDate: function()
        {
            return moment().local().startOf("week");
        },

        isThisWeek: function(dateToCheck)
        {
            var mondayOfWeekToCheck = this._getLocalMoment(dateToCheck).startOf("week");
            return datetime.getThisWeekStartDate().diff(mondayOfWeekToCheck, "days") === 0;
        },

        isToday: function(dateToCheck)
        {
            var midnightOfDateToCheck = this._getLocalMoment(dateToCheck).startOf("day");
            return datetime.getTodayDate().diff(midnightOfDateToCheck, "days") === 0;
        },

        isPast: function(dateToCheck)
        {
            var midnightOfDateToCheck = this._getLocalMoment(dateToCheck).startOf("day");
            return datetime.getTodayDate().diff(midnightOfDateToCheck, "days") > 0;           
        },

        isFuture: function(dateToCheck)
        {
            var midnightOfDateToCheck = this._getLocalMoment(dateToCheck).startOf("day");
            return datetime.getTodayDate().diff(midnightOfDateToCheck, "days") < 0;           
        },

        _getLocalMoment: function(date)
        {
            return moment.isMoment(date) ? date.local() : moment.local(date);
        }
    };

    return datetime;
});
