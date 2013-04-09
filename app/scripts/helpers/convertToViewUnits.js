/*
dayName accepts either a day number 0-6 (0 is sunday),
or any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'ddd', day name abbreviation)
*/

define(
[
    "handlebars",
    "utilities/conversion"
],
function(Handlebars, conversion)
{
    Handlebars.registerHelper("convertToViewUnits", conversion.convertToViewUnits);
    return conversion.convertToViewUnits;
});