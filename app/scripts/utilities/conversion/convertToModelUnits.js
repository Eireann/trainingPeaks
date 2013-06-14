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
    var convertToSpeedFromPace = function (pace, unitSystem)
    {

        var hours = dateTimeConvert.timeToDecimalHours(pace, { assumeHours: false });
        var minutes = hours * 60;
        var seconds = minutes * 60;

        if (seconds < 1)
        {
            return convertToSpeedFromPace("00:99:59", unitSystem);
        }

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

    var convertToModelUnits = function(value, fieldType, workoutType)
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
                return convertTemperature(value, userUnits);
            case "torque":
                return (+value / modelToViewConversionFactors(fieldType, userUnits));
            default:
                throw "Unknown field type for unit conversion";
        }
    };

    var convertTemperature = function(value, userUnits)
    {
        if (!userUnits)
        {
            userUnits = theMarsApp.user.get("units");
        }

        return userUnits === unitsConstants.English ? 5 / 9 * (value - 32) : value;
    };
    return convertToModelUnits;
});