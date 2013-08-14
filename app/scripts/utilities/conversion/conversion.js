define(
[
    "underscore",
    "moment",
    "utilities/datetime/datetime",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/conversion/adjustFieldRange"
], function(_, moment, datetimeUtils, workoutTypes, convertToModelUnits, convertToViewUnits, adjustFieldRange)
{
    return {
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits,

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
                value: value,
                fieldType: "distance",
                defaultValue: options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "",
                sportType: this.getMySportType(options)
            };

            if (options && options.precision)
            {
                parameters.precision = options.precision;
            }

            var convertedDistance = parseFloat(convertToViewUnits(parameters));
            var limitedDistance = adjustFieldRange(convertedDistance, "distance");
            var formattedDistance = this.formatEmptyValue(limitedDistance, options);
            return formattedDistance;
        },

        parseDistance: function(value, options)
        {
            var sportType = this.getMySportType(options);
            var modelValue = adjustFieldRange(parseFloat(value), "distance");
            modelValue = convertToModelUnits(modelValue, "distance", sportType);
            return modelValue;
        },

        formatDuration: function(value, options)
        {
            if (value <= 0 || value === "0")
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            }
            value = adjustFieldRange(value, "duration");
            return datetimeUtils.format.decimalHoursAsTime(value, true);
        },

        formatHours: function(value, options)
        {
            if (value <= 0 || value === "0")
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            }
            value = adjustFieldRange(value, "duration");
            return Math.round(value);
        },

        parseDuration: function(value, options)
        {
            var modelValue = datetimeUtils.convert.timeToDecimalHours(value);
            modelValue = adjustFieldRange(modelValue, "duration");
            return modelValue;
        },

        formatDurationFromSeconds: function(seconds, options)
        {
            var hours = seconds ? Number(seconds) / 3600 : 0;
            return this.formatDuration(hours, options);
        },

        parseDurationAsSeconds: function(value, options)
        {
            var hours = this.parseDuration(value, options);
            var seconds = hours * 3600;
            return seconds;
        },

        formatTimeOfDay: function(value, options)
        {
            var timeOfDay = moment(value);
            return timeOfDay.format("hh:mm:ss A");
        },

        parsePower: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "power");
            return modelValue;
        },

        formatPower: function(value, options)
        {
            var intPower = this.formatInteger(value, options, 0);
            var adjustedPower = adjustFieldRange(intPower, "power");
            return this.formatEmptyValue(adjustedPower, options);
        },

        formatPace: function(value, options)
        {
            if (!value)
                return this.formatEmptyValue(value, options);

            value = value.toFixed(6);
            
            var sportType = this.getMySportType(options);
            var paceAsMinutes = convertToViewUnits(value, "paceUnFormatted", undefined, sportType);
            var limitedPaceAsHours = adjustFieldRange(paceAsMinutes / 60, "pace");
            return datetimeUtils.format.decimalMinutesAsTime(limitedPaceAsHours * 60, true);
        },

        parsePace: function(value, options)
        {
            // utilize datetime smart parsing, but assume we're working with minutes
            if (!value)
            {
                return this.formatEmptyValue(value, options);
            }
            var sportType = this.getMySportType(options);
            var rawTime = datetimeUtils.convert.timeToDecimalHours(value, { assumeHours: false });
            var limitedTime = adjustFieldRange(rawTime, "pace");
            var formattedLimitedTime = datetimeUtils.format.decimalHoursAsTime(limitedTime, true);
            var convertedPace = convertToModelUnits(formattedLimitedTime, "pace", sportType);
            return convertedPace;
        },

        formatSpeed: function(value, options)
        {
            var sportType = this.getMySportType(options);
            var convertedSpeed = convertToViewUnits(value, "speed", undefined, sportType);
            var limitedSpeed = adjustFieldRange(convertedSpeed, "speed");
            return this.formatEmptyValue(limitedSpeed, options);
        },

        parseSpeed: function(value, options)
        {
            var sportType = this.getMySportType(options);
            var modelValue = adjustFieldRange(parseFloat(value), "speed");
            modelValue = convertToModelUnits(modelValue, "speed", sportType);
            return modelValue;
        },

        formatElevation: function(value, options)
        {
            var convertedValue = convertToViewUnits(value, "elevation");
            var limitedValue = adjustFieldRange(convertedValue, "elevation");
            return this.formatInteger(limitedValue, options, 0);
        },

        parseElevation: function(value, options)
        {
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevation");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatElevationGain: function(value, options)
        {
            var convertedValue = convertToViewUnits(value, "elevation");
            var limitedValue = adjustFieldRange(convertedValue, "elevationGain");
            return this.formatInteger(limitedValue, options);
        },

        parseElevationGain: function(value, options)
        {
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevationGain");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatElevationLoss: function(value, options)
        {
            var convertedValue = convertToViewUnits(value, "elevation");
            var limitedValue = adjustFieldRange(convertedValue, "elevationLoss");
            return this.formatInteger(limitedValue, options);
        },

        parseElevationLoss: function(value, options)
        {
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

        formatNumber: function(value, options)
        {
            value = convertToViewUnits(value, "number");
            return this.formatEmptyValue(value, options, 0);
        },

        formatInteger: function(value, options, defaultValue)
        {
            value = (value === null || value === 0) ? 0 : Math.round(parseFloat(value));
            return this.formatEmptyValue(value, options, defaultValue);
        },

        parseInteger: function(value, options)
        {
            return ((value === "" || value === "0") ? null : parseInt(value, 10));
        },

        parseFloat: function(value, options)
        {
            return (value === "" ? null : parseFloat(value));
        },

        formatTemperature: function(value, options)
        {
            var convertedValue = convertToViewUnits(value, "temperature");
            var adjustedValue = adjustFieldRange(convertedValue, "temp");
            return this.formatEmptyValue(adjustedValue, options, 0);
        },

        parseTemperature: function(value, options)
        {
            var limitedTemperature = adjustFieldRange(parseInt(value, 10), "temp");
            return convertToModelUnits(limitedTemperature, "temperature");
        },
        
        formatWorkoutType: function(value, options)
        {
            return workoutTypes.getNameById(value);
        },

        formatIF: function(value, options)
        {
            var formattedValue = value ? +(Math.round(value * 100) / 100).toFixed(2) : 0;
            var limitedValue = adjustFieldRange(formattedValue, "IF");
            return this.formatEmptyValue(limitedValue, options);
        },

        parseIF: function (value, options)
        {
            return adjustFieldRange(parseFloat(value).toFixed(2), "IF");
        },

        formatTSS: function(value, options)
        {
            var formattedValue = value ? (Math.round(value * 10) / 10).toFixed(1) : 0;
            var limitedValue = adjustFieldRange(formattedValue, "TSS");
            return this.formatEmptyValue(limitedValue, options);
        },

        parseTSS: function(value, options)
        {
            return adjustFieldRange(parseFloat(value).toFixed(1), "TSS");
        },

        formatTSB: function(value, options)
        {
            var formattedValue = value ? (Math.round(value * 10) / 10).toFixed(1) : 0;
            var limitedValue = adjustFieldRange(formattedValue, "TSB");
            return this.formatEmptyValue(limitedValue, options);
        },

        formatEnergy: function(value, options)
        {
            var formattedValue = value ? +(Math.round(value)) : 0;
            var limitedValue = adjustFieldRange(formattedValue, "energy");
            return this.formatEmptyValue(limitedValue, options);
        },

        parseEnergy: function(value, options)
        {
            var limitedValue = adjustFieldRange(value, "energy");
            return this.parseInteger(limitedValue);
        },

        formatTorque: function(value, options)
        {
            var parameters = {
                value: value,
                fieldType: "torque",
                defaultValue: options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "",
                sportType: this.getMySportType()
            };

            if (options && options.precision)
            {
                parameters.precision = options.precision;
            }

            var convertedValue = convertToViewUnits(parameters);
            var adjustedValue = adjustFieldRange(convertedValue, "torque");
            return this.formatEmptyValue(adjustedValue, options);
        },

        parseTorque: function(value, options)
        {
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
            return datetimeUtils.format(value, "dddd");
        },
        
        formatDateToCalendarDate: function (value, options)
        {
            return datetimeUtils.format(value, "MMM DD, YYYY");
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
            
            var parsedValue = parseFloat(value).toFixed(1);

            if (_.isNaN(parsedValue))
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            else
                return parsedValue;
        },

        formatPowerBalance: function(value, options)
        {
            var parsedValue = (parseFloat(value) * 100).toFixed(1);

            if (isNaN(value) || isNaN(parsedValue) || value === null || value === 0 || Number(parsedValue) === 0)
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            } else
            {
                return parsedValue;
            }
        },

        formatEfficiencyFactor: function(value, options)
        {
            return convertToViewUnits(value, "efficiencyfactor", undefined, this.getMySportType(options));
        },

        formatCalories: function(value, options)
        {
            var modelValue = this.formatInteger(value, options, 0);
            modelValue = adjustFieldRange(modelValue, "calories");
            return this.formatEmptyValue(modelValue, options);
        },

        parseCalories: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(parseFloat(value), "calories");
            return modelValue;               
        },

        parseHeartRate: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "heartrate");
            return modelValue;
        },

        formatHeartRate: function(value, options)
        {
            var intValue = this.formatInteger(value, options, 0);
            var adjustedValue = adjustFieldRange(intValue, "heartrate");
            return this.formatEmptyValue(adjustedValue, options);
        },

        parseCadence: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "cadence");
            return modelValue;
        },

        formatCadence: function(value, options)
        {
            var intValue = this.formatInteger(value, options, 0);
            var adjustedValue = adjustFieldRange(intValue, "cadence");
            return this.formatEmptyValue(adjustedValue, options);
        },

        formatEmptyValue: function(value, options, defaultValue)
        {

            if(options && options.hasOwnProperty("defaultValue"))
            {
                defaultValue = options.defaultValue;
            }
           
            if(_.isUndefined(defaultValue))
            {
                defaultValue = "";
            }

            if(_.isNaN(value) || _.isUndefined(value) || _.isNull(value))
            {
                return defaultValue;
            }

            if (value === 0 || value === "0" || Number(value) === 0)
            {
                return defaultValue;
            }

            return value;
        },

        parseTextField: function(value, options)
        {
            return value === "" ? null : this.fixNewlines(value);
        },

        formatTextField: function(value, options)
        {
            return value === null ? "" : this.fixNewlines(value);
        },

        fixNewlines: function(value)
        {
            if (value === null)
                return "";

            var newValue = value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            return newValue;
        },

        formatSwimDistance: function(value, options)
        {
            var swimOptions = _.extend({}, options, {workoutTypeValueId: 1});
            return this.formatDistance(value, swimOptions);
        }
         
    };
});
