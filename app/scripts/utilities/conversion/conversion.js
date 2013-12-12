define(
[
    "underscore",
    "moment",
    "utilities/datetime/datetime",
    "utilities/datetime/format",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/conversion/adjustFieldRange",
    "utilities/threeSigFig",
    "utilities/units/labels"
], function(_, moment, datetimeUtils, formatDateTime, workoutTypes, convertToModelUnits, convertToViewUnits, adjustFieldRange, threeSigFig, getUnitsLabel)
{
    var conversion = {

        // works if we have extended these conversion functions onto a view like in quickview, otherwise useless ...
        getMySportType: function(options)
        {
            var sportType = null;
            if (options && options.hasOwnProperty("workoutTypeValueId"))
            {
                sportType = options.workoutTypeValueId;
            } else if (options && options.hasOwnProperty("workoutTypeId"))
            {
                sportType = options.workoutTypeId;
            } else if (options && options.hasOwnProperty("model") && options.model.has("workoutTypeValueId"))
            {
                sportType = options.model.get("workoutTypeValueId");
            } else if (this.hasOwnProperty("model") && this.model.has("workoutTypeValueId"))
            {
                sportType = this.model.get("workoutTypeValueId");
            }
            return sportType;
        },

        formatDistance: function(value, options)
        {
            var parameters = {
                value: Number(value),
                fieldType: "distance",
                defaultValue: options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "",
                sportType: conversion.getMySportType(options)
            };

            var convertedDistance = Number(convertToViewUnits(parameters));
            var limitedDistance = adjustFieldRange(convertedDistance, "distance");
            var formattedDistance = threeSigFig(limitedDistance);
            return conversion.formatEmptyNumber(formattedDistance, options);
        },

        parseDistance: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var sportType = conversion.getMySportType(options);
            var modelValue = adjustFieldRange(Number(value), "distance");
            modelValue = convertToModelUnits(modelValue, "distance", sportType);
            return modelValue;
        },

        formatDuration: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }
            var numValue = Number(value);
            value = adjustFieldRange(numValue, "duration");
            return datetimeUtils.format.decimalHoursAsTime(value, _.has(options, "seconds") ? options.seconds : true);
        },

        formatMinutes: function(minutes, options)
        {
            if(conversion.valueIsEmpty(minutes))
            {
                return conversion.getDefaultValueForFormat(options);
            }
            var hours = Number(minutes) / 60;
            hours = adjustFieldRange(hours, "duration");
            return datetimeUtils.format.decimalHoursAsTime(hours, false);
        },

        formatHours: function(value, options)
        {
            if (value <= 0 || value === "0")
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            }
            var numValue = Number(value);
            var adjustedValue = adjustFieldRange(numValue, "duration");
            return Math.round(adjustedValue);
        },

        parseDuration: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var modelValue = datetimeUtils.convert.timeToDecimalHours(value);
            modelValue = adjustFieldRange(modelValue, "duration");
            return modelValue;
        },

        formatDurationFromSeconds: function(seconds, options)
        {
            var hours = seconds ? Number(seconds) / 3600 : 0;
            return conversion.formatDuration(hours, options);
        },

        parseDurationAsSeconds: function(value, options)
        {
            var hours = conversion.parseDuration(value, options);
            var seconds = hours * 3600;
            return seconds;
        },

        formatTimeOfDay: function(value, options)
        {
            var timeOfDay = moment(value);
            return timeOfDay.format("hh:mm A");
        },

        parsePower: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var modelValue = conversion.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "power");
            return modelValue;
        },

        formatPower: function(value, options)
        {
            var adjustedPower = adjustFieldRange(Number(value), "power");
            return conversion.formatInteger(adjustedPower, options);
        },
        
        formatPowerBalance: function(value, options)
        {
            value = value * 100;
            return conversion.formatPercent(100 - value, options) + "% / " + conversion.formatPercent(value, options) + "%";
        },

        formatPace: function(value, options)
        {
            if (!value)
                return conversion.formatEmptyNumber(value, options);

            value = Number(value);
            var sportType = conversion.getMySportType(options);
            var paceAsMinutes = convertToViewUnits(value, "paceUnFormatted", undefined, sportType);
            var limitedPaceAsHours = adjustFieldRange(paceAsMinutes / 60, "pace");
            return datetimeUtils.format.decimalMinutesAsTime(limitedPaceAsHours * 60, true);
        },

        formatLongitude: function(value, options)
        {
            return (value < 0 ? "W" : "E") + " " + Math.abs(value).toFixed(6);
        },

        formatLatitude: function(value, options)
        {
            return (value < 0 ? "S" : "N") + " " + Math.abs(value).toFixed(6);
        },

        parsePace: function(value, options)
        {

            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }

            var sportType = conversion.getMySportType(options);
            var assumeSeconds = sportType === 1 || sportType === 12; // Swim or Rowing
            var rawTime = datetimeUtils.convert.timeToDecimalHours(value, { assumeHours: false, assumeSeconds: assumeSeconds });
            var limitedTime = adjustFieldRange(rawTime, "pace");
            var formattedLimitedTime = datetimeUtils.format.decimalHoursAsTime(limitedTime, true);
            var convertedPace = convertToModelUnits(formattedLimitedTime, "pace", sportType);
            return convertedPace;
        },

        formatSpeed: function(value, options)
        {
            var sportType = conversion.getMySportType(options);
            var convertedSpeed = convertToViewUnits(Number(value), "speed", undefined, sportType);
            var limitedSpeed = adjustFieldRange(convertedSpeed, "speed");
            var formattedSpeed = threeSigFig(limitedSpeed);
            return conversion.formatEmptyNumber(formattedSpeed, options);
        },

        parseSpeed: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var sportType = conversion.getMySportType(options);
            var modelValue = adjustFieldRange(Number(value), "speed");
            modelValue = convertToModelUnits(modelValue, "speed", sportType);
            return modelValue;
        },

        formatElevation: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }

            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
            var limitedValue = adjustFieldRange(convertedValue, "elevation");

            options = _.defaults({ allowZero: true}, options);
            return conversion.formatInteger(limitedValue, options);
        },

        parseElevation: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevation");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatGroundControl: function(value, options)
        {
            return conversion.formatElevation(value, options);
        },

        formatElevationGain: function(value, options)
        {
            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
            var limitedValue = adjustFieldRange(convertedValue, "elevationGain");
            return conversion.formatInteger(limitedValue, options);
        },

        parseElevationGain: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevationGain");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatElevationLoss: function(value, options)
        {
            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
            var limitedValue = adjustFieldRange(convertedValue, "elevationLoss");
            return conversion.formatInteger(limitedValue, options);
        },

        parseElevationLoss: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevationLoss");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatPaHr: function(value, options)
        {
            return ((value === null || value === 0) ? "" : Number(value).toFixed(2));
        },

        formatPwHr: function(value, options)
        {
            return ((value === null || value === 0) ? "" : Number(value).toFixed(2));
        },

        formatWeight: function(value, options)
        {
            return conversion.formatEmptyNumber(Number(value).toFixed(1), options, 0);
        },

        formatNumber: function(value, options)
        {
            var formattedValue = threeSigFig(value);
            return conversion.formatEmptyNumber(formattedValue, options, 0);
        },

        formatInteger: function(value, options, defaultValue)
        {
            var numValue = Number(value);
            var formattedValue = numValue.toFixed(0);
            return conversion.formatEmptyNumber(formattedValue, options, defaultValue);
        },

        parseInteger: function(value, options)
        {
            var numValue = conversion.parseNumber(value, options);
            return numValue ? Math.round(numValue) : numValue;
        },

        parseNumber: function(value, options)
        {
            return (value === "" ? null : Number(value));
        },

        formatTemperature: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }
            var convertedValue = convertToViewUnits(Number(value), "temperature");
            var adjustedValue = adjustFieldRange(convertedValue, "temp");

            options = _.defaults({ allowZero: true}, options);
            return conversion.formatInteger(adjustedValue, options);
        },

        parseTemperature: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedTemperature = adjustFieldRange(parseInt(value, 10), "temp");
            return convertToModelUnits(limitedTemperature, "temperature");
        },

        formatWorkoutType: function(value, options)
        {
            return workoutTypes.getNameById(value);
        },

        formatIF: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "IF");
            return conversion.formatEmptyNumber(limitedValue.toFixed(2), options);
        },

        parseIF: function (value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            return adjustFieldRange(Number(value).toFixed(2), "IF");
        },

        formatTSS: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }

            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "TSS");
            return limitedValue.toFixed(1);
        },

        parseTSS: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            return adjustFieldRange(Number(value).toFixed(1), "TSS");
        },

        formatTSB: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "TSB");
            return conversion.formatEmptyNumber(limitedValue.toFixed(1), options);
        },

        formatEnergy: function(value, options)
        {
            var limitedValue = adjustFieldRange(Number(value), "energy");
            var formattedValue = conversion.formatInteger(limitedValue);
            return conversion.formatEmptyNumber(formattedValue, options);
        },

        parseEnergy: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedValue = adjustFieldRange(value, "energy");
            return conversion.parseInteger(limitedValue);
        },

        formatTorque: function(value, options)
        {
            var parameters = {
                value: Number(value),
                fieldType: "torque",
                defaultValue: options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "",
                sportType: conversion.getMySportType()
            };

            var convertedValue = convertToViewUnits(parameters);
            var adjustedValue = adjustFieldRange(convertedValue, "torque");
            return conversion.formatEmptyNumber(threeSigFig(adjustedValue), options);
        },

        parseTorque: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var limitedTorque = adjustFieldRange(value, "torque");
            return convertToModelUnits(limitedTorque, "torque");
        },

        formatWorkoutComments: function(commentsArray, options)
        {
            if (commentsArray && commentsArray.length && commentsArray[0].comment)
            {
                return commentsArray[0].comment;
            }
            return "";
        },

        formatDateToDayName: function (value, options)
        {
            options.dateFormat = "dddd";
            return conversion.formatDate(value, options);
        },

        formatDateToCalendarDate: function (value, options)
        {
            options.dateFormat = "MMM D, YYYY";
            return conversion.formatDate(value, options);
        },

        toPercent: function(numerator, denominator)
        {
            return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
        },

        formatGrade: function(value, options)
        {
            if (options && typeof options === "string" && value !== null)
                options = { defaultValue: options };

            if (_.isUndefined(value) || _.isNaN(value) || value === null || value === 0)
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";

            var parsedValue = Number(value);

            if (_.isNaN(parsedValue))
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            else
                return parsedValue.toFixed(1);
        },

        formatEfficiencyFactor: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "efficiencyfactor", undefined, conversion.getMySportType(options));
            return convertedValue.toFixed(2);
        },

        formatCalories: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "calories");
            var formattedValue = conversion.formatInteger(limitedValue, options, 0);
            return conversion.formatEmptyNumber(formattedValue, options);
        },

        parseCalories: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var intValue = conversion.parseInteger(value, options);
            intValue = adjustFieldRange(intValue, "calories");
            return intValue;
        },

        parseHeartRate: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var modelValue = conversion.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "heartrate");
            return modelValue;
        },

        formatHeartRate: function(value, options)
        {
            var adjustedValue = adjustFieldRange(Number(value), "heartrate");
            return conversion.formatInteger(adjustedValue, options);
        },

        parseCadence: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForParse(options);
            }
            var modelValue = conversion.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "cadence");
            return modelValue;
        },

        formatCadence: function(value, options)
        {
            var adjustedValue = adjustFieldRange(Number(value), "cadence");
            return conversion.formatInteger(adjustedValue, options);
        },

        formatEmptyNumber: function(value, options, defaultValue)
        {

            defaultValue = conversion.getDefaultValueForFormat(options, defaultValue);

            if(conversion.valueIsEmpty(value))
            {
                return defaultValue;
            }

            if(conversion.valueIsNotANumber(value))
            {
                return defaultValue;
            }

            if (conversion.valueIsZero(value) && (!options || !options.allowZero))
            {
                return defaultValue;
            }

            return value;
        },

        getDefaultValueForFormat: function(options, defaultValue)
        {
            if(options && options.hasOwnProperty("defaultValue"))
            {
                defaultValue = options.defaultValue;
            }

            if(_.isUndefined(defaultValue))
            {
                defaultValue = "";
            }

            return defaultValue;
        },

        getDefaultValueForParse: function(options, defaultValue)
        {
            if(options && options.hasOwnProperty("defaultValue"))
            {
                defaultValue = options.defaultValue;
            }

            if(_.isUndefined(defaultValue))
            {
                defaultValue = null;
            }

            return defaultValue;
        },

        valueIsEmpty: function(value)
        {
            return _.isUndefined(value) || _.isNull(value) || ("" + value).trim() === "" || (Number(value) === 0 && !conversion.valueIsZero(value));
        },

        valueIsNotANumber: function(value)
        {
            return _.isNaN(value) || _.isNaN(Number(value)) || _.isUndefined(value) || _.isNull(value);
        },

        valueIsZero: function(value)
        {
            return value === 0 || value === "0" || /^0+.?0*$/.test(value);
        },

        parseTextField: function(value, options)
        {
            return value === "" ? null : conversion.fixNewlinesForParse(value);
        },

        formatTextField: function(value, options)
        {
            return value === null ? "" : conversion.fixNewlinesForFormat(value);
        },

        // converts CRLF \r\n or LF \n to CR \r
        // FLEX WANTS \r, not \n, don't ask me why ...
        fixNewlinesForParse: function(value)
        {
            if (value === null)
                return "";

            var newValue = value.replace(/\r\n/g, "\r").replace(/\n/g, "\r");
            return newValue;
        },

        // converts LF \n or CR \r to CRLF \r\n
        fixNewlinesForFormat: function(value)
        {
            if (value === null)
                return "";

            var newValue = value.replace(/\r\n/g, "\n").replace(/\r/g,"\n").replace(/\n/g, "\r\n");
            return newValue;
        },

        formatSwimDistance: function(value, options)
        {
            var swimOptions = _.extend({}, options, {workoutTypeValueId: 1});
            return conversion.formatDistance(value, swimOptions);
        },

        parseCm: function(value, options)
        {
            var limitedValue = adjustFieldRange(value, "cm");
            return convertToModelUnits(limitedValue, "cm");
        },

        formatCm: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "cm");
            var adjustedValue = adjustFieldRange(convertedValue, "cm");
            return conversion.formatNumber(adjustedValue, options);
        },

        formatKg: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "kg");
            var adjustedValue = adjustFieldRange(convertedValue, "kg");
            return conversion.formatWeight(adjustedValue, options);
        },

        parseKg: function(value, options)
        {
            var limitedValue = adjustFieldRange(value, "kg");
            return convertToModelUnits(limitedValue, "kg");
        },

        formatMl: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "ml");
            var adjustedValue = adjustFieldRange(convertedValue, "ml");
            return conversion.formatNumber(adjustedValue, options);
        },

        parseMl: function(value, options)
        {
            var limitedValue = adjustFieldRange(value, "ml");
            return convertToModelUnits(limitedValue, "ml");
        },

        formatPercent: function(value, options)
        {
            var adjustedValue = adjustFieldRange(value, "%");
            return conversion.formatNumber(adjustedValue, options);
        },

        parsePercent: function(value, options)
        {
            value = conversion.parseNumber(value, options);
            return adjustFieldRange(value, "%");
        },

        formatDate: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return conversion.formatEmptyNumber(value);
            }
            return datetimeUtils.format(value, options.dateFormat);
        },

        parseDate: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return null;
            }
            return datetimeUtils.parse(value, options.dateFormat);
        },

        formatTime: function(value, options)
        {
            return formatDateTime.decimalSecondsAsTime(value / 1000);
        },

        /*
            options:
                defaultValue
                workoutTypeId
                withLabel
        */
        formatUnitsValue: function(units, value, options)
        {
            var string = conversion._formatUnitsValue(units, value, options);

            if(options && options.withLabel)
            {
                string += " " + getUnitsLabel(units, conversion.getMySportType(options));
            }

            return string;

        },

        _formatUnitsValue: function(units, value, options)
        {

            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }

            switch(units)
            {
                case "elevation":
                    return conversion.formatElevation(value, options);

                case "groundControl":
                    return conversion.formatGroundControl(value, options);

                case "elevationGain":
                    return conversion.formatElevationGain(value, options);

                case "elevationLoss":
                    return conversion.formatElevationLoss(value, options);

                case "speed":
                    return conversion.formatSpeed(value, options);

                case "pace":
                    return conversion.formatPace(value, options);

                case "power":
                case "rightpower":
                    return conversion.formatPower(value, options);

                case "torque":
                    return conversion.formatTorque(value, options);

                case "energy":
                    return conversion.formatEnergy(value, options);

                case "heartrate":
                    return conversion.formatHeartRate(value, options);

                case "duration":
                    return conversion.formatDuration(value, options);

                case "milliseconds":
                    return conversion.formatDuration(value / (1000 * 3600), options);

                case "distance":
                    return conversion.formatDistance(value, options);

                case "number":
                    return conversion.formatNumber(value, options);

                case "temperature":
                    return conversion.formatTemperature(value, options);

                case "if":
                    return conversion.formatIF(value, options);

                case "tss":
                    return conversion.formatTSS(value, options);

                case "tsb":
                    return conversion.formatTSB(value, options);

                case "cm":
                    return conversion.formatCm(value, options);

                case "kg":
                    return conversion.formatKg(value, options);

                case "ml":
                    return conversion.formatMl(value, options);

                case "grade":
                    return conversion.formatGrade(value, options);

                case "efficiencyfactor":
                    return conversion.formatEfficiencyFactor(value, options);

                case "powerbalance":
                    return conversion.formatPowerBalance(value, options);

                case "calories":
                    return conversion.formatCalories(value, options);

                case "mmHg":
                    if(_.isArray(value))
                    {
                        return _.map(value, function(val) { return conversion.formatInteger(val, options); }, this).join("/");
                    }
                    else
                    {
                        return conversion.formatInteger(value, options);
                    }
                    break;

                case "hours":
                case "kcal":
                case "mg/dL":
                case "mm":
                    return conversion.formatNumber(value, options);

                case "units":
                    var str = "";
                    if(_.isArray(value))
                    {
                        str += value[1] + " ";
                        value = value[0];
                    }
                    str += conversion.formatInteger(value, options);
                    return str;

                case "%":
                    return conversion.formatPercent(value, options);

                case "none":
                    return conversion.formatInteger(value, options);

                case "cadence":
                    return conversion.formatCadence(value, options);

                case "date":
                    return conversion.formatDate(value, options);

                case "time":
                    return conversion.formatTime(value, options);

                case "latitude":
                    return conversion.formatLatitude(value, options);

                case "longitude":
                    return conversion.formatLongitude(value, options);

                default:
                    throw new Error("Unsupported units for conversion.formatUnitsValue: " + units);
            }
        },

        parseUnitsValue: function(units, value, options)
        {
            switch(units)
            {
                case "elevation":
                    return conversion.parseElevation(value, options);

                case "speed":
                    return conversion.parseSpeed(value, options);

                case "pace":
                    return conversion.parsePace(value, options);

                case "duration":
                    return conversion.parseDuration(value, options);

                case "distance":
                    return conversion.parseDistance(value, options);

                case "number":
                    return conversion.parseNumber(value, options);

                case "heartrate":
                    return conversion.parseHeartRate(value, options);

                case "power":
                    return conversion.parsePower(value, options);

                case "cm":
                    return conversion.parseCm(value, options);

                case "kg":
                    return conversion.parseKg(value, options);

                case "ml":
                    return conversion.parseMl(value, options);

                case "%":
                    return conversion.parsePercent(value, options);

                case "units":
                case "none":
                case "mmHg":
                    return conversion.parseInteger(value, options);

                case "hours":
                case "kcal":
                case "mg/dL":
                case "mm":
                    return conversion.parseNumber(value, options);

                case "date":
                    return conversion.parseDate(value, options);

                case "tss":
                    return conversion.parseTSS(value, options);

                case "if":
                    return conversion.parseIF(value, options);

                case "energy":
                    return conversion.parseEnergy(value, options);

                default:
                     throw new Error("Unsupported units for conversion.parseUnitsValue: " + units);
            }
        }

    };

    return conversion;

});
