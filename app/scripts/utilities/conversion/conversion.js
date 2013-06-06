define(
[
    "moment",
    "utilities/datetime/datetime",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/conversion/adjustFieldRange"
], function(moment, datetimeUtils, workoutTypes, convertToModelUnits, convertToViewUnits, adjustFieldRange)
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

            return convertToViewUnits(parameters);

        },

        parseDistance: function(value, options)
        {
            var modelValue = adjustFieldRange(parseFloat(value), "distance");
            modelValue = convertToModelUnits(modelValue, "distance");
            return modelValue;
        },

        formatDuration: function(value, options)
        {
            value = adjustFieldRange(value, "distance");
            return datetimeUtils.format.decimalHoursAsTime(value, true, options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "", false);
        },

        parseDuration: function(value, options)
        {
            var modelValue = datetimeUtils.convert.timeToDecimalHours(value);
            modelValue = adjustFieldRange(modelValue, "duration");
            return modelValue;
        },

        formatDurationFromSeconds: function(value, options)
        {
            return datetimeUtils.format.decimalSecondsAsTime(value, true, undefined, false);
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
            var modelValue = this.parseFloat(value, options);
            modelValue = adjustFieldRange(modelValue, "power");
            return modelValue;
        },

        formatPace: function(value, options)
        {
            var formattedPace = convertToViewUnits(value, "pace");
            return formattedPace;
        },

        parsePace: function (value, options)
        {
            // utilize datetime smart parsing, but assume we're working with minutes
            var parts = value.split(":");
            while (parts.length < 3)
            {
                parts.unshift("0");
            }
            value = parts.join(":");
            var rawTime = datetimeUtils.convert.timeToDecimalHours(value);
            var limitedTime = adjustFieldRange(rawTime, "pace");
            var formattedLimitedTime = datetimeUtils.format.decimalHoursAsTime(limitedTime, true);
            var convertedPace = convertToModelUnits(formattedLimitedTime, "pace");
            return convertedPace;
        },
        
        formatSpeed: function(value, options)
        {
            return convertToViewUnits(value, "speed");
        },

        parseSpeed: function(value, options)
        {
            var modelValue = adjustFieldRange(parseFloat(value), "speed");
            modelValue = convertToModelUnits(modelValue, "speed");
            return modelValue;
        },

        formatElevation: function (value, options)
        {
            return convertToViewUnits(value, "elevation");
        },

        parseElevation: function (value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "elevation");
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
            return ((value === null || value === 0) ? "" : convertToViewUnits(value, "number"));
        },

        formatInteger: function(value, options)
        {
            return ((value === null || value === 0) ? (options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "") : (Math.round(parseFloat(value))).toFixed(0));
        },

        parseInteger: function (value, options)
        {
            return ((value === "" || value === "0") ? null : parseInt(value, 10));
        },
        
        parseFloat: function (value, options)
        {
            return (value === "" ? null : parseFloat(value));
        },

        formatTemperature: function (value, options)
        {
            return convertToViewUnits(value, "temperature");
        },

        parseTemperature: function(value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "temperature");
        },
        
        formatWorkoutType: function(value, options)
        {
            return workoutTypes.getNameById(value);
        },

        formatIF: function(value, options)
        {
            return value ? +(Math.round(value * 100) / 100).toFixed(2) : "";
        },

        parseIF: function (value, options)
        {
            return value ? (Math.round(parseFloat(value) * 100) / 100).toFixed(2) : 0;
        },

        formatTSS: function(value, options)
        {
            return value ? (Math.round(value * 10) / 10).toFixed(1) : (options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "--");
        },

        parseTSS: function (value, options)
        {
            var modelValue =  value ? (Math.round(parseFloat(value) * 10) / 10).toFixed(1) : 0;
            modelValue = adjustFieldRange(modelValue, "tss");
            return modelValue;
        },
        
        formatEnergy: function (value, options)
        {
            return value ? +(Math.round(value)) : "";
        },

        parseEnergy: function (value, options)
        {
            return value ? (Math.round(parseFloat(value))).toFixed(0) : 0;
        },
        
        formatTorque: function (value, options)
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

            return convertToViewUnits(parameters);
        },

        parseTorque: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "torque");
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

        formatPercent: function(value, options)
        {
            return ((value === null || value === 0) ? (options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "") : parseFloat(value).toFixed(1));
        },

        formatEfficiencyFactor: function(value, options)
        {
            return convertToViewUnits(value, "efficiencyfactor", undefined, this.getMySportType(options));
        }

    };
});