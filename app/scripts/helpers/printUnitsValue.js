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