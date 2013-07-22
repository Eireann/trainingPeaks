define(
[
    "underscore",
    "handlebars",
    "TP"
],
function (_, Handlebars, TP)
{
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var conversionHelper = function (conversionMethod, value, context, defaultValue)
    {
        if (!conversionMethod || !TP.utils.conversion[conversionMethod])
            throw "Unknown conversion method for conversion template helper: " + conversionMethod;

        if (typeof defaultValue !== "undefined")
        {
            context = _.clone(context);
            context.defaultValue = defaultValue;
        }

        return TP.utils.conversion[conversionMethod](value, context);
    };

    Handlebars.registerHelper("conversion", conversionHelper);
    return conversionHelper;
});