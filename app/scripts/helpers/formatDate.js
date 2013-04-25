/*
formatDate accepts any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'L')
*/
define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatDate", TP.utils.datetime.format);
    return TP.utils.datetime.format;
});