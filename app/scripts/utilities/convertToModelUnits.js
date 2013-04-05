define(
[
    "utilities/modelToViewConversionFactors"
],
function(modelToViewConversionFactors)
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
        var currentUnits = theMarsApp.user.get("units");

        switch (fieldType)
        {
            case "elevation":
                return (+value / modelToViewConversionFactors[fieldType][currentUnits]);
            case "speed":
            case "distance":
                return (+value / modelToViewConversionFactors[fieldType][currentUnits]);
            case "pace":
                return convertToSpeedFromPace(value, currentUnits);
            case "temperature":
                return currentUnits === "0" ? 5 / 9 * (value - 32) : value;
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    return convertToModelUnits;
});