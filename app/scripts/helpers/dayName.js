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

        console.log(dateOrDayNumber);
        console.log(formatString);

        if (!formatString || typeof formatString !== "string")
        {
            formatString = "ddd";
        }

        var theDay;
        if (typeof dateOrDayNumber === 'number')
        {
            theDay = moment().day(dateOrDayNumber);
        } else
        {
            theDay = moment(dateOrDayNumber);
        }

        var output = printDate(theDay, formatString);
        console.log(output);
        return output;

    };

    Handlebars.registerHelper("dayName", dayName);
    return dayName;
});