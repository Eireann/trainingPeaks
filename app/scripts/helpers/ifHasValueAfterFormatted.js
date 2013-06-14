define(
[
    "underscore",
    "handlebars",
    "TP"
],
function (_, Handlebars, TP)
{

    var ifHasValueAfterFormatted = function(conversionMethod, value, context, options)
    {
        var formattedValue = TP.utils.conversion[conversionMethod](value, context);

        if (!_.isUndefined(formattedValue) && !_.isNull(formattedValue) && formattedValue !== "" && Number(formattedValue) !== 0)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifHasValueAfterFormatted", ifHasValueAfterFormatted);
    return ifHasValueAfterFormatted;
});