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
    
    var convertToSpeedFromPace = function (pace, unitSystem)
    {
        if (pace <= 0.01)
            return "99:99";

        var speed;

        return speed;
    };
    
    var convertToModelUnits = function (value, fieldType, workoutType)
    {
        var currentUnits = theMarsApp.user.get("unitsValue");

        switch (fieldType)
        {
            case "elevation":
                return (+value / modelToViewConversionFactors[fieldType][currentUnits]);
            case "speed":
            case "distance":
                return (+value / modelToViewConversionFactors[fieldType][currentUnits]);
            case "pace":
                return convertToSpeedFromPace(value, currentUnits);
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    Handlebars.registerHelper("convertToModelUnits", convertToModelUnits);
    return convertToModelUnits;
});