/*
dayName accepts either a day number 0-6 (0 is sunday),
or any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'ddd', day name abbreviation)
*/

define(
[
    "handlebars",
    "moment",
    "./printDate"
],
function(Handlebars, moment, printDate)
{
    var dayName = function(dateOrDayNumber, formatString)
    {
        if (!formatString || typeof formatString !== "string")
            formatString = "ddd";

        var theDay;
        if (typeof dateOrDayNumber === 'number')
            theDay = moment().day(dateOrDayNumber);
        else
            theDay = moment(dateOrDayNumber);

        return printDate(theDay, formatString);
    };

    Handlebars.registerHelper("dayName", dayName);
    return dayName;
});