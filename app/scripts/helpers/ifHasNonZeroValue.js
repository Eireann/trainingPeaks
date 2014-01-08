define(
[
    "underscore",
    "handlebars",
    "TP"
],
function (_, Handlebars, TP)
{

    var ifHasNonZeroValue = function(units, value, context)
    {
        var formattedValue = TP.utils.conversion.formatUnitsValue(units, value, context);

        var valueAsNumber = Number(formattedValue);
        if(!_.isNaN(valueAsNumber) && valueAsNumber !== 0)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifHasNonZeroValue", ifHasNonZeroValue);
    return ifHasNonZeroValue;
});