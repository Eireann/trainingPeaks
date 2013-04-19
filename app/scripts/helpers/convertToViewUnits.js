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
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var convertToViewUnitsHelper = function(value, fieldType, defaultValueIfEmpty, handlebarsContext)
    {
        if (arguments.length == 3)
        {
            defaultValueIfEmpty = undefined;
        }
        return conversion.convertToViewUnits(value, fieldType, defaultValueIfEmpty);
    }
    Handlebars.registerHelper("convertToViewUnits", convertToViewUnitsHelper);
    return convertToViewUnitsHelper;
});