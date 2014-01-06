define(
[
    "underscore",
    "moment",
    "utilities/datetime/convert",
    "utilities/datetime/format",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
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
            convertToModelUnits,
            convertToViewUnits,
            adjustFieldRange,
            threeSigFig,
            getUnitsLabel,
            UnitsStrategyFactory
            )
{
    var conversion = {

        /*
            options:
                defaultValue
                workoutTypeId
                withLabel
        */
        formatUnitsValue: function(units, value, options)
        {

            var string;
            switch(units)
            {
                case "distance":
                case "speed":
                case "duration":
                case "pace":
                case "calories":
                case "elevation":
                case "elevationGain":
                case "elevationLoss":
                case "energy":
                case "tss":
                    var unitsStrategy = conversion._buildStrategyForUnits(units, options);
                    return unitsStrategy.formatValue(value);


                case "minutes":
                case "seconds":
                case "milliseconds":
                case "hours":
                case "timeofday":
                case "power":
                case "powerbalance":
                case "latitude":
                case "longitude":

                    // if the input is null or empty string, return empty string or other default value
                    if(conversion.valueIsEmpty(value) || conversion.valueIsNotANumber(value) || !_.isFinite(value))
                    {
                        return conversion.getDefaultValueForFormat(options);
                    }           

                    // convert to view units if necessary
                    var sportType = conversion._getMySportType(options);
                    var convertedValue = conversion._convertToViewUnits(units, value, sportType);

                    // limit if necessary
                    var limitedValue = conversion._adjustFieldRange(units, convertedValue);

                    // format it
                    string = conversion.formatEmptyNumber(conversion._formatNumberForView(units, limitedValue, options), options);
                    break;

                default:

                    string = conversion._formatUnitsValueOld(units, value, options);
                    break;
            }

            // add a units label
            if(options && options.withLabel)
            {
                // TODO: use the unitsStrategy methods
                string += " " + getUnitsLabel(units, conversion._getMySportType(options));
            }

            return string;

        },

        _buildStrategyForUnits: function(units, options)
        {
            var strategyOptions = _.defaults({}, options, {workoutTypeId: conversion._getMySportType(options)});
            return UnitsStrategyFactory.buildStrategyForUnits(units, strategyOptions);
        },

        /*
            options:
                defaultValue
                workoutTypeId
        */
        parseUnitsValue: function(units, value, options)
        {
            switch(units)
            {

                case "distance":
                case "speed":
                case "duration":
                case "pace":
                case "calories":
                case "elevation":
                case "elevationGain":
                case "elevationLoss":
                case "energy":
                case "tss":
                    var unitsStrategy = conversion._buildStrategyForUnits(units, options);
                    return unitsStrategy.parseValue(value);

                default: 
                    return conversion._parseUnitsValue(units, value, options);
            }
        },


        _parseUnitsValue: function(units, value, options)
        {
            switch(units)
            {

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

                case "if":
                    return conversion.parseIF(value, options);

                default:
                     throw new Error("Unsupported units for conversion.parseUnitsValue: " + units);
            }
        },

        _convertToViewUnits: function(units, value, sportType)
        {
            var convertibleUnitTypes = [
                "groundControl",
                "speed",
                "distance",
                "paceUnFormatted",
                "temperature",
                "torque",
                "efficiencyfactor",
                "cm",
                "kg",
                "ml"
            ];

            switch(units)
            {

                case "milliseconds":
                    return (Number(value) / 1000) / 3600;

                case "seconds":
                    return Number(value) / 3600;

                default:
                    if(_.contains(convertibleUnitTypes, units))
                    {
                        return convertToViewUnits(Number(value), units, undefined, sportType);
                    }
                    else
                    {
                        return Number(value);
                    }
                    break;
            }
        },

        _adjustFieldRange: function(units, value)
        {
            switch(units)
            {
                case "milliseconds":
                case "seconds":
                case "minutes":
                case "hours":
                    return adjustFieldRange(value, "duration");

                default:
                    return adjustFieldRange(value, units);
            }
        },

        _formatNumberForView: function(units, value, options)
        {
            switch(units)
            {

                case "hours":
                    return Math.round(value);

                case "minutes":
                    return new DateTimeFormatter().decimalHoursAsTime(value, false);

                case "seconds":
                case "milliseconds":
                    return new DateTimeFormatter().decimalHoursAsTime(value, true);

                case "timeofday":
                    return moment(value).format("hh:mm A");

                case "power":
                    return Number(value).toFixed(0);

                case "powerbalance":
                    value = value * 100;
                    return conversion.formatPercent(100 - value, options) + "% / " + conversion.formatPercent(value, options) + "%";

                case "longitude": 
                    return (value < 0 ? "W" : "E") + " " + Math.abs(value).toFixed(6);

                case "latitude":
                    return (value < 0 ? "S" : "N") + " " + Math.abs(value).toFixed(6);

                default:
                    return value;
            }

        },

        _formatUnitsValueOld: function(units, value, options)
        {

            if(conversion.valueIsEmpty(value))
            {
                return conversion.getDefaultValueForFormat(options);
            }

            switch(units)
            {
                case "groundControl":
                    return conversion.formatGroundControl(value, options);

                case "speed":
                    return conversion.formatSpeed(value, options);

                case "pace":
                    return conversion.formatPace(value, options);

                case "rightpower":
                    return conversion.formatPower(value, options);

                case "torque":
                    return conversion.formatTorque(value, options);

                case "heartrate":
                    return conversion.formatHeartRate(value, options);

                case "milliseconds":
                    return conversion.formatDuration(value / (1000 * 3600), options);

                case "number":
                    return conversion.formatNumber(value, options);

                case "temperature":
                    return conversion.formatTemperature(value, options);

                case "if":
                    return conversion.formatIF(value, options);

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

                default:
                    throw new Error("Unsupported units for conversion.formatUnitsValue: " + units);
            }
        },

        // works if we have extended these conversion functions onto a view like in quickview, otherwise useless ...
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

        formatDurationFromSeconds: function(seconds, options)
        {
            return conversion.formatUnitsValue("seconds", seconds, options);
        },

        formatTimeOfDay: function(value, options)
        {
            return conversion.formatUnitsValue("timeofday", value, options);
        },

        formatTime: function(value, options)
        {
            return conversion.formatUnitsValue("milliseconds", value, options);
        },

        formatPower: function(value, options)
        {
            return conversion.formatUnitsValue("power", value, options);
        },

        formatPowerBalance: function(value, options)
        {
            return conversion.formatUnitsValue("powerbalance", value, options);
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

        // REFACTOR THESE:
        parseDurationAsSeconds: function(value, options)
        {
            var hours = conversion.parseDuration(value, options);
            var seconds = hours * 3600;
            return seconds;
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

        formatTSB: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "TSB");
            return conversion.formatEmptyNumber(limitedValue.toFixed(1), options);
        },

        formatTorque: function(value, options)
        {
            var parameters = {
                value: Number(value),
                fieldType: "torque",
                defaultValue: options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "",
                sportType: conversion._getMySportType()
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
            var convertedValue = convertToViewUnits(Number(value), "efficiencyfactor", undefined, conversion._getMySportType(options));
            return convertedValue.toFixed(2);
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

            if (conversion.valueIsZero(value))
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
            return new DateTimeFormatter().format(value, options.dateFormat);
        },

        parseDate: function(value, options)
        {
            if(conversion.valueIsEmpty(value))
            {
                return null;
            }
            return new DateTimeFormatter().parse(value, options.dateFormat);
        }

    };

    return conversion;

});
