define(
[
    "TP",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/workoutTypeEnum2"
], function (TP, convertToModelUnits, convertToViewUnits, workoutTypeEnum2)
{
    return {
        convertToModelUnits: convertToModelUnits,
        convertToViewUnits: convertToViewUnits,
        
        getDistance: function (value, options)
        {
            return +convertToViewUnits(value, "distance", null, null, 2);
        },

        setDistance: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "distance");
        },

        getTime: function (value, options)
        {
            return TP.utils.datetime.format.timeFromDecimalHours(value, true);
        },

        setTime: function(value, options)
        {
            return TP.utils.datetime.convert.timeToDecimalHours(value);
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
            return +convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "speed");
        },

        getElevation: function (value, options)
        {
            return +convertToViewUnits(value, "elevation");
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
            return +convertToViewUnits(value, "temperature");
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
        }
        
    };
});