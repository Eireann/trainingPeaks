define(
[
    "utilities/modelToViewConversionFactors"
],
function(modelToViewConversionFactors)
{
    var convertToPaceFromSpeed = function(speed, unitSystem)
    {
        if (speed <= 0.01)
            return "99:99";

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

    var convertToViewUnits = function(value, fieldType, workoutType, defaultValue, decimalPlaces)
    {
        if (!_.isNumber(value))
            return typeof defaultValue !== 'undefined' ? defaultValue : "";
        
        var currentUnits = theMarsApp.user.get("units");
        
        switch(fieldType)
        {
            case "elevation":
                return (value * modelToViewConversionFactors[fieldType][currentUnits]).toFixed(0);
            case "speed":
            case "distance":
                var convertedValue = value * modelToViewConversionFactors[fieldType][currentUnits];
                return convertedValue >= 100 && !decimalPlaces ? convertedValue.toFixed(1) : convertedValue.toFixed(2);
            case "pace":
                return convertToPaceFromSpeed(value, currentUnits);
            case "temperature":
            {
                var convertedVal = currentUnits === "0" ? 9 / 5 * value + 32 : value;
                return decimalPlaces !== null ? convertedVal.toFixed(decimalPlaces) : convertedVal.toFixed(0);
            }
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    return convertToViewUnits;
});