define(
[
    "underscore",
    "handlebars",
    "TP"
],
function(_, Handlebars, TP)
{
    var bound = _.bind(TP.utils.datetime.formatter.decimalSecondsAsTime, TP.utils.datetime.formatter);
    Handlebars.registerHelper("formatSeconds", bound);
    return bound;
});