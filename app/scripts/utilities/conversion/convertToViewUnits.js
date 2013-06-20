define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/conversion/modelToViewConversionFactors",
    "utilities/units/constants",
    "utilities/datetime/datetime",
    "utilities/threeSigFig"
],
function(
    _,
    workoutTypes,
    modelToViewConversionFactors,
    unitsConstants,
    dateTimeUtils,
    threeSigFig)
{
    var minimumPace = 0.00277778; // 99:59:59.99
    var almostOneHundredHoursAsMinutes = (99 + (59 / 60) + (59.99 / 3600)) * 60;

    var convertToPaceFromSpeed = function(speed, doFormat, sportTypeId)
    {
        if (speed <= minimumPace)
            return doFormat ? "99:59:59.99" : almostOneHundredHoursAsMinutes;

        unitSystem = theMarsApp.user.get("units");

        // paceInMinutes = 1 / (speed * conversionFactor)
        // speed = 1 / (paceInMinutes * conversionFactor)
        var conversionFactor = modelToViewConversionFactors("pace", unitSystem, sportTypeId);
        var paceInMinutes = 1 / (speed * conversionFactor);

        return doFormat ? dateTimeUtils.format.decimalMinutesAsTime(paceInMinutes, true) : paceInMinutes;
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

    var convertElevation = function(value)
    {
        var currentUnits = theMarsApp.user.get("units");
        return Math.round(parseFloat(value * modelToViewConversionFactors("elevation", currentUnits)));
    };

    var convertEfficiencyFactor = function(value, workoutType)
    {
        var currentUnits = theMarsApp.user.get("units");
        var runType = workoutTypes.getIdByName("Run");
        var walkType = workoutTypes.getIdByName("Walk");

        if (workoutType && (workoutType === runType || workoutType === walkType))
        {
            return (value * modelToViewConversionFactors("efficiencyfactor", currentUnits)).toFixed(2);
        }
		else
        {
            return value.toFixed(2);
		}
    };

    var convertTemperature = function(value)
    {
        var currentUnits = theMarsApp.user.get("units");
        return Math.round(currentUnits === unitsConstants.English ? 9 / 5 * value + 32 : value).toFixed(0);
    };

    var convertDistanceToViewUnits = function(value, sportTypeId, precision)
    {
        var conversionFactor = modelToViewConversionFactors("distance", theMarsApp.user.get("units"), sportTypeId);
        var convertedValue = value * conversionFactor;
        return threeSigFig(convertedValue, precision);
    };
    
    var convertTorqueToViewUnits = function (value, precision)
    {
        return threeSigFig(value * modelToViewConversionFactors("torque", theMarsApp.user.get("units")));
    };

    var convertSpeedToViewUnits = function(value, sportTypeId)
    {
        var conversionFactor = modelToViewConversionFactors("speed", theMarsApp.user.get("units"), sportTypeId);
        var convertedValue = value * conversionFactor;
        return threeSigFig(convertedValue);
    };

    return function(value, fieldType, defaultValueIfEmpty, sportType)
    {
        var precision = null;
        if (_.isObject(value))
        {
            var parameters = value;
            value = parameters.value;
            fieldType = parameters.fieldType;
            defaultValueIfEmpty = parameters.defaultValue;
            sportType = parameters.sportType;
            precision = parameters.precision;
        }

        if (!isNumeric(value) || (Number(value) === 0 && fieldType !== "temperature") && fieldType !== "groundControl")
        {
            if (!_.isUndefined(defaultValueIfEmpty))
            {
                return defaultValueIfEmpty;
            }
            else
            {
                return "";
            }
        }

        switch (fieldType)
        {
            case "groundControl":
                return convertElevation(value);
            case "elevation":
                return convertElevation(value);
            case "speed":
                return convertSpeedToViewUnits(value, sportType);
            case "distance":
                return convertDistanceToViewUnits(value, sportType, precision);
            case "pace":
                return convertToPaceFromSpeed(value, true, sportType);
            case "paceUnFormatted":
                return convertToPaceFromSpeed(value, false, sportType);
            case "temperature":
                return convertTemperature(value);
            case "rightpower":
                return value;
            case "power":
                return value;
            case "torque":
                return convertTorqueToViewUnits(value);
            case "heartrate":
                return value;
            case "cadence":
                return value;
            case "number":
                return threeSigFig(value);
            case "efficiencyfactor":
                return convertEfficiencyFactor(value, sportType);
            default:
                throw +fieldType + ": Unknown field type for unit conversion";
        }
    };
});