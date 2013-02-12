/*
dayName accepts either a day number 0-6 (0 is sunday),
or any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'ddd', day name abbreviation)
*/

define(
[
    "handlebars"
],
function(Handlebars)
{
    var printUnitsValue = function(value)
    {
        if (value === 0)
            return "English";
        else
            return "Metric";
    };
    
    Handlebars.registerHelper("printUnitsValue", printUnitsValue);
    return printUnitsValue;
});