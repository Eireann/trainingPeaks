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
        return TP.utils.conversion[conversionMethod](value);
    };

    Handlebars.registerHelper("conversion", conversionHelper);
    return conversionHelper;
});