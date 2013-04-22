define(
[],
function()
{
    var printUnitsValue = function(value)
    {
        if (value === 0)
            return "English";
        else
            return "Metric";
    };

    return printUnitsValue;
});