/*
dayName accepts either a day number 0-6 (0 is sunday),
or any object/string that is parseable by moment.js,
plus a moment.js compatible formatString (defaults to 'ddd', day name abbreviation)
*/

define([],
function()
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

    return getDefaultValue;
});