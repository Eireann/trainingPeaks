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
        },
        "pace":
        {
            "0": 26.8224,
            "1": 16.666666666667
        },
        "speed":
        {
            "0": 2.236936,
            "1": 3.6
        },
        "elevation":
        {
            "0": 3.28084,
            "1": 1
        }
    };
    
    var convertToViewUnits = function(value, fieldType, workoutType)
    {
        var currentUnits = theMarsApp.user.get("unitsValue");
        
        switch(fieldType)
        {
            case "distance":
            case "elevation":
            case "pace":
            case "speed":
                return (value * modelToViewConversionFactors[fieldType][currentUnits]).toFixed(2);
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    Handlebars.registerHelper("convertToViewUnits", convertToViewUnits);
    return convertToViewUnits;
});