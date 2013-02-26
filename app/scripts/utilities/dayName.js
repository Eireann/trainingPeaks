/*
dayName accepts either a day number 0-6 (0 is sunday),
or any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'ddd', day name abbreviation)
*/

define(
[
    "moment",
    "./printDate"
],
function(moment, printDate)
{
    var dayName = function(dateOrDayNumber, formatString)
    {
        if (!formatString || typeof formatString !== "string")
            formatString = "ddd";

        var theDay;
        // 0-7 day index, but if we get a larger number assume it's a timestamp
        if (typeof dateOrDayNumber === 'number' && dateOrDayNumber <= 7)
            theDay = moment().day(dateOrDayNumber);
        else
            theDay = moment(dateOrDayNumber);

        return printDate(theDay, formatString);
    };

    return dayName;
});