define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var convertToViewUnitsHelper = function(value, fieldType, defaultValueIfEmpty, handlebarsContext)
    {
        if (arguments.length === 3)
        {
            defaultValueIfEmpty = undefined;
        }

        return TP.utils.conversion.formatUnitsValue(fieldType, value, {defaultValue: defaultValueIfEmpty});
    };

    Handlebars.registerHelper("convertToViewUnits", convertToViewUnitsHelper);
    return convertToViewUnitsHelper;
});