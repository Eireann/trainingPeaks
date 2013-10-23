define(
[
    "moment",
    "handlebars"
],
function(moment, Handlebars)
{
    var formatMonth = function(month, format, options)
    {
        // assumes 1-12 as months, subtract one to get moment's zero based index
        return moment().month(month - 1).format(format);
    };
    Handlebars.registerHelper("formatMonth", formatMonth);
    return formatMonth;
});