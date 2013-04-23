define(
[
    "moment",
    "utilities/datetime/datetime",
    "utilities/workout/workout",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits"
], function(moment, datetimeUtils, workoutUtils, convertToModelUnits, convertToViewUnits)
{
    return {
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits,
        
        formatDistance: function (value, options)
        {
            return convertToViewUnits(value, "distance");
        },

        parseDistance: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "distance");
        },

        formatTime: function (value, options)
        {
            return datetimeUtils.format.decimalHoursAsTime(value, true, "");
        },

        parseTime: function(value, options)
        {
            return datetimeUtils.convert.timeToDecimalHours(value);
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

        formatNumber: function (value, options)
        {
            return ((value === null || value === 0) ? "" : +value);
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

        parseTemperature: function (value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "temperature");
        },
        
        formatWorkoutType: function(value, options)
        {
            return workoutUtils.types.getNameById(value);
        },

        formatIF: function(value, options)
        {
            return value ? +(Math.round(value * 100) / 100) : "";
        },

        parseIF: function (value, options)
        {
            return value ? (Math.round(parseFloat(value) * 100) / 100).toFixed(2) : 0;
        },
        
        formatTSS: function (value, options)
        {
            return value ? (Math.round(value * 10) / 10) : "";
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
        }
        

        
    };
});