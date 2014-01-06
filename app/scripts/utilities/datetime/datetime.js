﻿define(
[
    "moment",
    "utilities/datetime/format",
    "utilities/datetime/convert"
], function(moment, DateTimeFormatter, convert)
{

    var formatter = new DateTimeFormatter();

    return {

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

        isThisWeek: function(dateToCheck)
        {
            var thisMonday = moment().day(1);
            var mondayOfWeekToCheck = moment(dateToCheck).day(1);
            return mondayOfWeekToCheck.isoWeek() === thisMonday.isoWeek() && mondayOfWeekToCheck.year() === thisMonday.year();
        }
    };
});
