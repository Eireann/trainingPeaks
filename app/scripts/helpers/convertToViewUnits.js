define(
[
    "handlebars",
    "utilities/modelToViewConversionFactors"
],
function(Handlebars, modelToViewConversionFactors)
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
    
    var convertToViewUnits = function(value, fieldType, workoutType)
    {
        if (!_.isNumber(value))
            return "";
        
        var currentUnits = theMarsApp.user.get("unitsValue");
        
        switch(fieldType)
        {
            case "elevation":
                return (value * modelToViewConversionFactors[fieldType][currentUnits]).toFixed(0);
            case "speed":
            case "distance":
                return (value * modelToViewConversionFactors[fieldType][currentUnits]).toFixed(2);
            case "pace":
                return convertToPaceFromSpeed(value, currentUnits);
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    Handlebars.registerHelper("convertToViewUnits", convertToViewUnits);
    return convertToViewUnits;
});