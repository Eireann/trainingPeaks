define(
[
    "underscore",
    "utilities/conversion/modelToViewConversionFactors"
],
function(_, modelToViewConversionFactors)
{
    var convertToSpeedFromPace = function (pace, unitSystem)
    {
        if (pace <= 0.01)
            return "99:99";

        pace = pace.split(":");

        // if no colon assume whole minutes
        if (pace.length !== 2)
            pace.push("00");

        var minutes = parseInt(pace[0], 10);
        var seconds = parseInt(pace[1], 10);
        var fractionOfMinute = seconds / 60;
        minutes += fractionOfMinute;

        var conversion = modelToViewConversionFactors("speed", unitSystem);
        var speed = 60 / minutes / conversion;
        
        return speed;
    };
    
    var isNumeric = function(value)
    {
        if (value === null)
        {
            return false;
        }

        if (_.isString(value) && !value.trim())
        {
            return false;
        }

        var asNumber = Number(value);
        return _.isNumber(asNumber) && !_.isNaN(asNumber);
    };

    var isTimeString = function(value)
    {
        var stringValue = "" + value;
        var valueWithoutColons = value.replace(/:/g, "");
        return isNumeric(valueWithoutColons);
    };

    var convertToModelUnits = function (value, fieldType, workoutType)
    {
        var userUnits = theMarsApp.user.get("units");

        if (fieldType === "pace" && !isTimeString(value))
        {
            return null;
        } else if (fieldType !== "pace" && !isNumeric(value))
        {
            return null;
        }

        switch (fieldType)
        {
            case "elevation":
                return (+value / modelToViewConversionFactors(fieldType, userUnits));
            case "speed":
            case "distance":
                return (+value / modelToViewConversionFactors(fieldType, userUnits));
            case "pace":
                return convertToSpeedFromPace(value, userUnits);
            case "temperature":
                return userUnits === "0" ? 5 / 9 * (value - 32) : value;
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    return convertToModelUnits;
});