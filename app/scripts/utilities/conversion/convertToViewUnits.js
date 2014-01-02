define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/conversion/modelToViewConversionFactors",
    "utilities/units/constants",
    "utilities/datetime/datetime"
],
function(
    _,
    workoutTypes,
    modelToViewConversionFactors,
    unitsConstants,
    dateTimeUtils
){
    var minimumPace = 0.00277778; // 99:59:59.99
    var almostOneHundredHoursAsMinutes = (99 + (59 / 60) + (59.99 / 3600)) * 60;

    var convertToPaceFromSpeed = function(speed, doFormat, sportTypeId)
    {
        if (speed <= minimumPace)
            return doFormat ? "99:59:59.99" : almostOneHundredHoursAsMinutes;

        var unitSystem = theMarsApp.user.getUnitsBySportType(sportTypeId);

        // paceInMinutes = 1 / (speed * conversionFactor)
        // speed = 1 / (paceInMinutes * conversionFactor)
        var conversionFactor = modelToViewConversionFactors("pace", unitSystem, sportTypeId);
        var paceInMinutes = 1 / (speed * conversionFactor);

        return doFormat ? dateTimeUtils.formatter.decimalMinutesAsTime(paceInMinutes, true) : paceInMinutes;
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
        var currentUnits = theMarsApp.user.getUnitsBySportType();
        var numValue = Number(value);
        var returnValue = numValue * modelToViewConversionFactors("elevation", currentUnits);
        return returnValue;
    };

    var convertEfficiencyFactor = function(value, workoutType)
    {
        var currentUnits = theMarsApp.user.getUnitsBySportType(workoutType);
        var runType = workoutTypes.getIdByName("Run");
        var walkType = workoutTypes.getIdByName("Walk");

        if (workoutType && (workoutType === runType || workoutType === walkType))
        {
            return value * modelToViewConversionFactors("efficiencyfactor", currentUnits);
        }
		else
        {
            return value;
		}
    };

    var convertTemperature = function(value)
    {
        var currentUnits = theMarsApp.user.getUnitsBySportType();
        return currentUnits === unitsConstants.English ? 9 / 5 * value + 32 : value;
    };

    var convertDistanceToViewUnits = function(value, sportTypeId)
    {
        var conversionFactor = modelToViewConversionFactors("distance", theMarsApp.user.getUnitsBySportType(sportTypeId), sportTypeId);
        var convertedValue = value * conversionFactor;
        return convertedValue;
    };
    
    var convertTorqueToViewUnits = function (value)
    {
        return value * modelToViewConversionFactors("torque", theMarsApp.user.getUnitsBySportType());
    };

    var convertSpeedToViewUnits = function(value, sportTypeId)
    {
        var conversionFactor = modelToViewConversionFactors("speed", theMarsApp.user.getUnitsBySportType(sportTypeId), sportTypeId);
        var convertedValue = value * conversionFactor;
        return convertedValue;
    };

    return function(value, fieldType, defaultValueIfEmpty, sportType)
    {
        if (_.isObject(value))
        {
            var parameters = value;
            value = parameters.value;
            fieldType = parameters.fieldType;
            defaultValueIfEmpty = parameters.defaultValue;
            sportType = parameters.sportType;
        }

        if (!isNumeric(value) || (Number(value) === 0 && fieldType !== "temperature") && fieldType !== "groundControl")
        {
            if (!_.isUndefined(defaultValueIfEmpty))
            {
                return Number(defaultValueIfEmpty);
            }
            else
            {
                return 0;
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
                return convertDistanceToViewUnits(value, sportType);
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
                return value;
            case "efficiencyfactor":
                return convertEfficiencyFactor(value, sportType);
            case "cm":
                return value * modelToViewConversionFactors("cm", theMarsApp.user.getUnitsBySportType(sportType));
            case "kg":
                return value * modelToViewConversionFactors("kg", theMarsApp.user.getUnitsBySportType(sportType));
            case "ml":
                return value * modelToViewConversionFactors("ml", theMarsApp.user.getUnitsBySportType(sportType));
            default:
                throw new Error(+fieldType + ": Unknown field type for unit conversion");
        }
    };
});
