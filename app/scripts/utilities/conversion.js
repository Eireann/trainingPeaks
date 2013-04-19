define(
[
    "utilities/conversion/convertTimeHoursToDecimal",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/workoutTypeEnum2"
], function (convertTimeHoursToDecimal, convertToModelUnits, convertToViewUnits, printTimeFromDecimalHours, workoutTypeEnum2)
{
    return {
        convertTimeHoursToDecimal: convertTimeHoursToDecimal,
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits,
        
        getDistance: function (value, options)
        {
            return convertToViewUnits(value, "distance");
        },

        setDistance: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "distance");
        },

        getTime: function (value, options)
        {
            return printTimeFromDecimalHours(value, true);
        },

        setTime: function (value, options)
        {
            return conversion.convertTimeHoursToDecimal(value);
        },

        getPace: function (value, options)
        {
            return convertToViewUnits(value, "pace");
        },

        setPace: function (value, options)
        {
            return convertToModelUnits(value, "pace");
        },

        getSpeed: function (value, options)
        {
            return convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "speed");
        },

        getElevation: function (value, options)
        {
            return convertToViewUnits(value, "elevation");
        },

        setElevation: function (value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "elevation");
        },

        getNumber: function (value, options)
        {
            return ((value === null || value === 0) ? "" : +value);
        },

        setInteger: function (value, options)
        {
            return ((value === "" || value === "0") ? null : parseInt(value, 10));
        },

        setFloat: function (value, options)
        {
            return (value === "" ? null : parseFloat(value));
        },

        getTemperature: function (value, options)
        {
            return convertToViewUnits(value, "temperature");
        },

        setTemperature: function (value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "temperature");
        },
        
        getWorkoutType: function(value, options)
        {
            //Yes, I know this sucks
            //TODO: make this not suck
            return workoutTypeEnum2[value];
        },
        
        getIF: function (value, options)
        {
            return +(Math.round(value * 100) / 100);
        },

        setIF: function (value, options)
        {
            return (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
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