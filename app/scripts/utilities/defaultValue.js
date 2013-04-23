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