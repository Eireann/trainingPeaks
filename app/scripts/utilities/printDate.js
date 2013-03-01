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
        if (!formatString || typeof formatString !== "string")
        {
            formatString = "DD";
        }

        return moment(momentParseableDate).format(formatString);
    };

    return printDate;
});