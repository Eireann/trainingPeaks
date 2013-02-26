/*
printDate accepts any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'L')
*/
define(
[
    "handlebars",
    "utilities/printDate"
],
function(Handlebars, printDate)
{
    Handlebars.registerHelper("printDate", printDate);
    return printDate;
});