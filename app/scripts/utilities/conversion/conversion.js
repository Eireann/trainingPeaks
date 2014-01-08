define(
[
    "underscore",
    "moment",
    "utilities/datetime/convert",
    "utilities/datetime/format",
    "utilities/workout/workoutTypes",
    "utilities/conversion/adjustFieldRange",
    "utilities/threeSigFig",
    "utilities/units/labels",
    "utilities/units/unitsStrategyFactory"
], function(
            _,
            moment,
            dateTimeConversion,
            DateTimeFormatter,
            workoutTypes,
            adjustFieldRange,
            threeSigFig,
            getUnitsLabel,
            UnitsStrategyFactory
            )
{
    var conversion = {

        // REFACTOR THESE:
        formatWorkoutType: function(value, options)
        {
            return workoutTypes.getNameById(value);
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


        // KEEP THESE
        /*
            options:
                defaultValue
                workoutTypeId
                withLabel
        */
        formatUnitsValue: function(units, value, options)
        {
            var unitsStrategy = conversion._buildStrategyForUnits(units, options);
            return unitsStrategy.formatValue(value);
        },

        /*
            options:
                defaultValue
                workoutTypeId
        */
        parseUnitsValue: function(units, value, options)
        {
            var unitsStrategy = conversion._buildStrategyForUnits(units, options);
            return unitsStrategy.parseValue(value);
        },

        // keep this
        toPercent: function(numerator, denominator)
        {
            return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
        },

        _buildStrategyForUnits: function(units, options)
        {
            var strategyOptions = _.defaults({}, options, {workoutTypeId: conversion._getMySportType(options)});
            return UnitsStrategyFactory.buildStrategyForUnits(units, strategyOptions);
        },

        _getMySportType: function(options)
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
       



        // DEPRECATE THESE:
        formatDistance: function(value, options)
        {
            return conversion.formatUnitsValue("distance", value, options);
        },

        formatDuration: function(value, options)
        {
            return conversion.formatUnitsValue("duration", value, options); 
        },

        formatMinutes: function(value, options)
        {
            return conversion.formatUnitsValue("minutes", value, options);
        },

        formatHours: function(value, options)
        {
            return conversion.formatUnitsValue("hours", value, options);
        },

        parseDurationAsSeconds: function(seconds, options)
        {
            return conversion.formatUnitsValue("seconds", seconds, options);
        },

        formatDurationFromSeconds: function(seconds, options)
        {
            return conversion.formatUnitsValue("seconds", seconds, options);
        },

        formatTime: function(value, options)
        {
            return conversion.formatUnitsValue("milliseconds", value, options);
        },

        formatPower: function(value, options)
        {
            return conversion.formatUnitsValue("power", value, options);
        },

        formatPace: function(value, options)
        {
            return conversion.formatUnitsValue("pace", value, options);
        },        

        parsePace: function(value, options)
        {
            return conversion.parseUnitsValue("pace", value, options);
        },

        formatSpeed: function(value, options)
        {
            return conversion.formatUnitsValue("speed", value, options);
        },

        formatElevation: function(value, options)
        {
            return conversion.formatUnitsValue("elevation", value, options);
        },

        parseDistance: function(value, options)
        {
            return conversion.parseUnitsValue("distance", value, options);
        }, 

        parseSpeed: function(value, options)
        {
            return conversion.parseUnitsValue("speed", value, options);
        }, 

        parseDuration: function(value, options)
        {
            return conversion.parseUnitsValue("duration", value, options);
        },

        formatCalories: function(value, options)
        {
            return conversion.formatUnitsValue("calories", value, options);
        },

        parseCalories: function(value, options)
        {
            return conversion.parseUnitsValue("calories", value, options);
        },

        formatElevationGain: function(value, options)
        {
            return conversion.formatUnitsValue("elevationGain", value, options);
        },

        parseElevationGain: function(value, options)
        {
            return conversion.parseUnitsValue("elevationGain", value, options);
        },

        parseElevation: function(value, options)
        {
            return conversion.parseUnitsValue("elevation", value, options);
        },

        formatGroundControl: function(value, options)
        {
            return conversion.formatUnitsValue("elevation", value, options);
        },

        formatElevationLoss: function(value, options)
        {
            return conversion.formatUnitsValue("elevationLoss", value, options);
        },

        parseElevationLoss: function(value, options)
        {
            return conversion.parseUnitsValue("elevation", value, options);
        },

        formatEnergy: function(value, options)
        {
            return conversion.formatUnitsValue("energy");
        },

        parseEnergy: function(value, options)
        {
            return conversion.parseUnitsValue("energy");
        },

        formatTSS: function(value, options)
        {
            return conversion.formatUnitsValue("tss", value, options);
        },

        parseTSS: function(value, options)
        {
            return conversion.parseUnitsValue("tss", value, options);
        },

        formatIF: function(value, options)
        {
            return conversion.formatUnitsValue("if", value, options);
        },

        parseIF: function (value, options)
        {
            return conversion.parseUnitsValue("if", value, options);
        },

        parseHeartRate: function(value, options)
        {
            return conversion.parseUnitsValue("heartrate", value, options);
        },

        formatHeartRate: function(value, options)
        {
            return conversion.formatUnitsValue("heartrate", value, options);
        },

        parseCadence: function(value, options)
        {
            return conversion.parseUnitsValue("cadence", value, options);
        },

        formatCadence: function(value, options)
        {
            return conversion.formatUnitsValue("cadence", value, options);
        },

        formatTorque: function(value, options)
        {
            return conversion.formatUnitsValue("torque", value, options);
        },

        parseTorque: function(value, options)
        {
            return conversion.parseUnitsValue("torque", value, options);
        },

        formatTemperature: function(value, options)
        {
            return conversion.formatUnitsValue("temperature", value, options);
        },

        parseTemperature: function(value, options)
        {
            return conversion.parseUnitsValue("temperature", value, options);
        },

        formatEfficiencyFactor: function(value, options)
        {
            return conversion.formatUnitsValue("efficiencyFactor", value, options);
        },

        parseEfficiencyFactor: function(value, options)
        {
            return conversion.parseUnitsValue("efficiencyFactor", value, options);
        },

        formatKg: function(value, options)
        {
            return conversion.formatUnitsValue("kg", value, options);
        },

        parseKg: function(value, options)
        {
            return conversion.parseUnitsValue("kg", value, options);
        },

        parseCm: function(value, options)
        {
            return conversion.parseUnitsValue("cm", value, options);
        },

        formatCm: function(value, options)
        {
            return conversion.formatUnitsValue("cm", value, options);
        },

        formatMl: function(value, options)
        {
            return conversion.formatUnitsValue("ml", value, options);
        },

        parseMl: function(value, options)
        {
            return conversion.parseUnitsValue("ml", value, options);
        },

        formatPowerBalance: function(value, options)
        {
            return conversion.formatUnitsValue("powerbalance", value, options);
        },

        formatPercent: function(value, options)
        {
            return conversion.formatUnitsValue("percent", value, options);
        },

        parsePercent: function(value, options)
        {
            return conversion.parseUnitsValue("percent", value, options);
        },

        formatTimeOfDay: function(value, options)
        {
            return conversion.formatUnitsValue("timeofday", value, options);
        },

        formatDate: function(value, options)
        {
            return conversion.formatUnitsValue("date", value, options);
        },

        parseDate: function(value, options)
        {
            return conversion.parseUnitsValue("date", value, options);
        },

        formatInteger: function(value, options)
        {
            return conversion.formatUnitsValue("integer", value, options);
        },

        formatNumber: function(value, options)
        {
            return conversion.formatUnitsValue("number", value, options);
        },

        parsePower: function(value, options)
        {
            return conversion.parseUnitsValue("power", value, options);
        },

        formatTSB: function(value, options)
        {
            return conversion.formatUnitsValue("tsb", value, options);
        },

        formatGrade: function(value, options)
        {
            return conversion.formatUnitsValue("grade", value, options);
        },

        formatPaHr: function(value, options)
        {
            return conversion.formatUnitsValue("speedPulseDecoupling", value, options);
        },

        formatPwHr: function(value, options)
        {
            return conversion.formatUnitsValue("powerPulseDecoupling", value, options);
        }

    };

    return conversion;

});
