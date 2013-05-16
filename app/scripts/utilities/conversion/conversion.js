define(
[
    "moment",
    "utilities/datetime/datetime",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits"
], function(moment, datetimeUtils, workoutTypes, convertToModelUnits, convertToViewUnits)
{
    return {
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits,

        // works if we have extended these conversion functions onto a view like in quickview, otherwise useless ...
        getMySportType: function()
        {
            var sportType = null;
            if (this.hasOwnProperty("model") && this.model.has("workoutTypeValueId"))
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
                sportType: this.getMySportType()
            };

            if (options && options.precision)
            {
                parameters.precision = options.precision;
            }

            return convertToViewUnits(parameters);

        },

        parseDistance: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "distance");
        },

        formatDuration: function(value, options)
        {
            return datetimeUtils.format.decimalHoursAsTime(value, true, options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "");
        },

        parseDuration: function(value, options)
        {
            return datetimeUtils.convert.timeToDecimalHours(value);
        },

        formatDurationFromSeconds: function(value, options)
        {
            return datetimeUtils.format.decimalSecondsAsTime(value);
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

        formatPace: function(value, options)
        {
            return convertToViewUnits(value, "pace");
        },

        parsePace: function (value, options)
        {
            return convertToModelUnits(value, "pace");
        },

        formatSpeed: function(value, options)
        {
            return convertToViewUnits(value, "speed");
        },

        parseSpeed: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "speed");
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
            return ((value === null || value === 0) ? "" : +value);
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
        
        formatTSS: function (value, options)
        {
            return value ? (Math.round(value * 10) / 10).toFixed(1) : (options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "");
        },

        parseTSS: function (value, options)
        {
            return value ? (Math.round(parseFloat(value) * 10) / 10).toFixed(1) : 0;
        },
        
        formatEnergy: function (value, options)
        {
            return value ? +(Math.round(value)) : "";
        },

        parseEnergy: function (value, options)
        {
            return value ? (Math.round(parseFloat(value))).toFixed(0) : 0;
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
        }

    };
});