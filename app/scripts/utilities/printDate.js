/*
printDate accepts any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'L')
*/
define(
[
    "moment"
],
function(moment)
{
    var printDate = function(momentParseableDate, formatString)
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

    return printDate;
});