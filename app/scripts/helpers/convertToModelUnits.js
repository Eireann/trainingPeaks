define(
[
    "handlebars",
    "utilities/modelToViewConversionFactors"
],
function(Handlebars, modelToViewConversionFactors)
{
    var convertToSpeedFromPace = function (pace, unitSystem)
    {
        if (pace <= 0.01)
            return "99:99";

        pace = pace.split(":");

        if (pace.length !== 2)
            return 0;

        var minutes = parseInt(pace[0], 10);
        var seconds = parseInt(pace[1], 10);
        var fractionOfMinute = seconds / 60;
        minutes += fractionOfMinute;

        var conversion = modelToViewConversionFactors.speed[unitSystem];
        var speed = 60 / minutes / conversion;
        
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