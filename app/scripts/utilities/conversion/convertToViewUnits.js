define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/conversion/modelToViewConversionFactors",
    "utilities/units/constants"
],
function(
    _,
    workoutTypes,
    modelToViewConversionFactors,
    unitsConstants)
{
    var convertToPaceFromSpeed = function(speed, unitSystem)
    {

        if (speed <= 0.01)
            return "99:99";

        if (!unitSystem)
            unitSystem = theMarsApp.user.get("units");

        var pace;
        var conversion = modelToViewConversionFactors("speed", unitSystem);
        speed = speed * conversion / 60;
        pace = (1 / speed).toFixed(2);

        var hours = 0;
        var minutes = Math.floor(pace);

        if (minutes >= 60)
        {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
        }


        if (minutes < 10) minutes = "0" + minutes;

        var seconds = ((pace % 1) * 60).toFixed(0);
        if (seconds < 10) seconds = "0" + seconds;

        return hours ? (hours + ":" + minutes + ":" + seconds) : (minutes + ":" + seconds);
    };

    var roundViewUnits = function(value, precision)
    {
        if (!isNumeric(value))
        {
            return null;
        }

        if (!_.isNumber(value))
        {
            value = Number(value);
        }

        if (_.isNumber(precision))
        {
            return value.toFixed(precision);
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
        return (value * modelToViewConversionFactors("elevation", currentUnits)).toFixed(0);
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

    var convertDistanceToViewUnits = function(value, sportType, precision)
    {

        var convertedValue = value * modelToViewConversionFactors("distance", theMarsApp.user.get("units"));

        //Disabled until we address changing QV unit options
        //var swimType = workoutTypes.getIdByName("Swim");
        //if (swimType === sportType)
        //{
        //    return Math.round(convertedValue);
        //} else
        //{
        //    return roundViewUnits(convertedValue, precision);
        //}
        
        return roundViewUnits(convertedValue, precision);
    };
    
    var convertTorqueToViewUnits = function (value, precision)
    {
        return roundViewUnits(value * modelToViewConversionFactors("torque", theMarsApp.user.get("units")));
    };

    var convertSpeedToViewUnits = function(value)
    {
        return roundViewUnits(value * modelToViewConversionFactors("speed", theMarsApp.user.get("units")));
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

        if (!isNumeric(value) || (Number(value) === 0 && fieldType !== "temperature"))
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
            case "elevation":
                return convertElevation(value);
            case "speed":
                return convertSpeedToViewUnits(value);
            case "distance":
                return convertDistanceToViewUnits(value, sportType, precision);
            case "pace":
                return convertToPaceFromSpeed(value);
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
                return roundViewUnits(value);
            case "efficiencyfactor":
                return convertEfficiencyFactor(value, sportType);
            default:
                throw +fieldType + ": Unknown field type for unit conversion";
        }
    };
});