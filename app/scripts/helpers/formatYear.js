define(
[
    "moment",
    "handlebars"
],
function(moment, Handlebars)
{
    // uses 1-12 months, subtract one to get moment's zero based index
    var formatYear = function(year, format, options)
    {
        return moment().year(year).format(format);
    };
    Handlebars.registerHelper("formatYear", formatYear);
    return formatYear;
});