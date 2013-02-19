define(
[
    "handlebars"
],
function(Handlebars)
{
    var modelToViewConversionFactors =
    {
        "distance":
        {
            "0": 0.000621371,
            "1": 0.001
        }
    };
    
    var convertToViewUnits = function(value, fieldType, workoutType)
    {
    };

    Handlebars.registerHelper("convertToViewUnits", convertToViewUnits);
    return convertToViewUnits;
});