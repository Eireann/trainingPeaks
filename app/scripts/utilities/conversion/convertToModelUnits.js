define(
[
    "underscore",
    "utilities/conversion/modelToViewConversionFactors",
    "utilities/datetime/convert",
    "utilities/units/constants"
],
function(
    _,
    modelToViewConversionFactors,
    dateTimeConvert,
    unitsConstants)
{
    var convertToSpeedFromPace = function (pace, unitSystem, sportTypeId)
    {

        var paceInHours = dateTimeConvert.timeToDecimalHours(pace, { assumeHours: false });
        var paceInMinutes = paceInHours * 60;
        var paceInSeconds = paceInMinutes * 60;

        if (paceInSeconds < 1)
        {
            return convertToSpeedFromPace("00:99:59", unitSystem, sportTypeId);
        }

        var conversionFactor = modelToViewConversionFactors("pace", unitSystem, sportTypeId);

        // paceInMinutes = 1 / (speed * conversionFactor)
        // speed = 1 / (paceInMinutes * conversionFactor)
        var speed = 1 / (paceInMinutes * conversionFactor);
        
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

    var convertToModelUnits = function(value, fieldType, workoutTypeId)
    {
        var userUnits = theMarsApp.user.getUnitsBySportType(workoutTypeId);

        if (fieldType === "pace" && !isTimeString(value))
        {
            return null;
        } else if (fieldType !== "pace" && !isNumeric(value))
        {
            return null;
        }

        switch (fieldType)
        {
            case "pace":
                return convertToSpeedFromPace(value, userUnits, workoutTypeId);
            case "temperature":
                return convertTemperature(value, userUnits);
            case "elevation":
            case "speed":
            case "distance":
            case "torque":
            case "cm":
            case "kg":
            case "ml":
                return (+value / modelToViewConversionFactors(fieldType, userUnits, workoutTypeId));
            default:
                throw new Error("Unknown field type for unit conversion: " + fieldType);
        }
    };

    var convertTemperature = function(value, userUnits)
    {
        if (!userUnits)
        {
            userUnits = theMarsApp.user.getUnitsBySportType();
        }

        return userUnits === unitsConstants.English ? 5 / 9 * (value - 32) : value;
    };
    return convertToModelUnits;
});
