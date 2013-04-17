define(
[
    "underscore",
    "utilities/modelToViewConversionFactors"
],
function(_, modelToViewConversionFactors)
{
    var convertToPaceFromSpeed = function(speed, unitSystem)
    {

        if (speed <= 0.01)
            return "99:99";

        if (!unitSystem)
            unitSystem = theMarsApp.user.get("units");

        var pace;
        var conversion = modelToViewConversionFactors.speed[unitSystem];
        speed = speed * conversion / 60;
        pace = (1 / speed).toFixed(2);
        var minutes = Math.floor(pace);
        if (minutes < 10) minutes = "0" + minutes;
        var seconds = ((pace % 1) * 60).toFixed(0);
        if (seconds < 10) seconds = "0" + seconds;

        return (minutes + ":" + seconds);
    };

    var roundViewUnits = function(value)
    {
        if (!isNumeric(value))
        {
            return null;
        }

        if (!_.isNumber(value))
        {
            value = Number(value);
        }

        if (value >= 100)
        {
            return Math.round(value);
        } else if (value >= 10)
        {
            return value.toFixed(1);
        } else
        {
            return value.toFixed(2);
        }
    };

    var isNumeric = function(value)
    {
        if (_.isString(value) && !value.trim())
        {
            return false;
        }

        var asNumber = Number(value);
        return _.isNumber(asNumber) && !_.isNaN(asNumber);
    };

    var convertToViewUnits = function(value, fieldType, defaultValueIfEmpty)
    {
        if (!isNumeric(value))
        {
            if (!_.isUndefined(defaultValueIfEmpty))
            {
                return defaultValueIfEmpty;
            } else
            {
                return "";
            }
        }

        switch (fieldType)
        {
            case "elevation":
                return convertElevation(value);
            case "speed":
            case "distance":
                return convertDistanceToViewUnits(value);
            case "pace":
                return convertToPaceFromSpeed(value);
            case "temperature":
                return convertTemperature(value);
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    var convertElevation = function(value)
    {
        var currentUnits = theMarsApp.user.get("units");
        return (value * modelToViewConversionFactors["elevation"][currentUnits]).toFixed(0);
    };

    var convertTemperature = function(value)
    {
        var currentUnits = theMarsApp.user.get("units");
        return roundViewUnits(currentUnits === "0" ? 9 / 5 * value + 32 : value);
    };

    var convertDistanceToViewUnits = function(value)
    {
        return roundViewUnits(value * modelToViewConversionFactors["distance"][theMarsApp.user.get("units")]);
    };

    return convertToViewUnits;
});