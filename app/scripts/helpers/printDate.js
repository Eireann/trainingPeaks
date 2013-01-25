/*
printDate accepts any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'L')
*/
define(
[
    "handlebars",
    "moment"
],
function(Handlebars, moment)
{
    var printDate = function(dateAsLongEpoch, formatString)
    {
        if (!formatString || typeof formatString !== "string")
        {
            formatString = "L";
        }

        var output = moment(dateAsLongEpoch).format(formatString);
        return output;
    };

    Handlebars.registerHelper("printDate", printDate);
    return printDate;
});