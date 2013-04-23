define(
[
    "handlebars",
    "utilities/conversion"
],
function(Handlebars, conversion)
{
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var convertToViewUnitsHelper = function(value, fieldType, defaultValueIfEmpty, handlebarsContext)
    {
        if (arguments.length === 3)
        {
            defaultValueIfEmpty = undefined;
        }
        return conversion.convertToViewUnits(value, fieldType, defaultValueIfEmpty);
    };

    Handlebars.registerHelper("convertToViewUnits", convertToViewUnitsHelper);
    return convertToViewUnitsHelper;
});