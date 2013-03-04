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
    function getDefaultValue(value, defaultValue)
    {
        if (typeof value === "undefined" || value === null)
        {
            return defaultValue;
        } else
        {
            return value;
        }
    }

    Handlebars.registerHelper("defaultValue", getDefaultValue);
    return getDefaultValue;
});