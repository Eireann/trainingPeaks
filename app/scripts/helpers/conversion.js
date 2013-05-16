define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var conversionHelper = function (conversionMethod, value)
    {
        if (!conversionMethod || !TP.utils.conversion[conversionMethod])
            throw "Unknown conversion method for conversion template helper: " + conversionMethod;

        return TP.utils.conversion[conversionMethod](value);
    };

    Handlebars.registerHelper("conversion", conversionHelper);
    return conversionHelper;
});