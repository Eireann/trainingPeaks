define(
[
    "underscore",
    "moment",
    "utilities/datetime/datetime",
    "utilities/workout/workoutTypes",
    "utilities/conversion/convertToModelUnits",
    "utilities/conversion/convertToViewUnits",
    "utilities/conversion/adjustFieldRange",
    "utilities/threeSigFig"
], function(_, moment, datetimeUtils, workoutTypes, convertToModelUnits, convertToViewUnits, adjustFieldRange, threeSigFig)
{
    return {

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
                sportType: this.getMySportType(options)
            };

            if (options && options.precision)
            {
                parameters.precision = options.precision;
            }

            var convertedDistance = Number(convertToViewUnits(parameters));
            var limitedDistance = adjustFieldRange(convertedDistance, "distance");
            var formattedDistance = threeSigFig(limitedDistance);
            return this.formatEmptyNumber(formattedDistance, options);
        },

        parseDistance: function(value, options)
        {
            var sportType = this.getMySportType(options);
            var modelValue = adjustFieldRange(Number(value), "distance");
            modelValue = convertToModelUnits(modelValue, "distance", sportType);
            return modelValue;
        },

        formatDuration: function(value, options)
        {
            if (value <= 0 || value === "0")
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            }
            var numValue = Number(value);
            value = adjustFieldRange(numValue, "duration");
            return datetimeUtils.format.decimalHoursAsTime(value, true);
        },

        formatMinutes: function(minutes, options)
        {
            if (minutes <= 0 || minutes === "0")
            {
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
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
            var adjustedPower = adjustFieldRange(Number(value), "power");
            return this.formatInteger(adjustedPower, options);
        },

        formatPace: function(value, options)
        {
            if (!value)
                return this.formatEmptyNumber(value, options);

            value = Number(value);
            var sportType = this.getMySportType(options);
            var paceAsMinutes = convertToViewUnits(value, "paceUnFormatted", undefined, sportType);
            var limitedPaceAsHours = adjustFieldRange(paceAsMinutes / 60, "pace");
            return datetimeUtils.format.decimalMinutesAsTime(limitedPaceAsHours * 60, true);
        },

        parsePace: function(value, options)
        {
            // utilize datetime smart parsing, but assume we're working with minutes
            if (!value)
                return this.formatEmptyNumber(value, options);

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
            var convertedSpeed = convertToViewUnits(Number(value), "speed", undefined, sportType);
            var limitedSpeed = adjustFieldRange(convertedSpeed, "speed");
            var formattedSpeed = threeSigFig(limitedSpeed);
            return this.formatEmptyNumber(formattedSpeed, options);
        },

        parseSpeed: function(value, options)
        {
            var sportType = this.getMySportType(options);
            var modelValue = adjustFieldRange(Number(value), "speed");
            modelValue = convertToModelUnits(modelValue, "speed", sportType);
            return modelValue;
        },

        formatElevation: function(value, options)
        {
            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
            var limitedValue = adjustFieldRange(convertedValue, "elevation");
            return this.formatInteger(limitedValue, options, "0");
        },

        parseElevation: function(value, options)
        {
            var limitedValue = adjustFieldRange(parseInt(value, 10), "elevation");
            return convertToModelUnits(limitedValue, "elevation");
        },

        formatGroundControl: function(value, options)
        {
            return this.formatElevation(value, options);
        },

        formatElevationGain: function(value, options)
        {
            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
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
            var numValue = Number(value);
            var convertedValue = Number(convertToViewUnits(numValue, "elevation"));
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
            var formattedValue = threeSigFig(value);
            return this.formatEmptyNumber(formattedValue, options, 0);
        },

        formatInteger: function(value, options, defaultValue)
        {
            var numValue = Number(value);
            var formattedValue = numValue.toFixed(0);
            return this.formatEmptyNumber(formattedValue, options, defaultValue);
        },

        parseInteger: function(value, options)
        {
            var numValue = Number(value);
            return Math.round(numValue); 
        },

        Number: function(value, options)
        {
            return (value === "" ? null : Number(value));
        },

        formatTemperature: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "temperature");
            var adjustedValue = adjustFieldRange(convertedValue, "temp");
            return this.formatInteger(adjustedValue, options, "0");
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
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "IF");
            return this.formatEmptyNumber(limitedValue.toFixed(2), options);
        },

        parseIF: function (value, options)
        {
            return adjustFieldRange(Number(value).toFixed(2), "IF");
        },

        formatTSS: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "TSS");
            return this.formatEmptyNumber(limitedValue.toFixed(1), options);
        },

        parseTSS: function(value, options)
        {
            return adjustFieldRange(Number(value).toFixed(1), "TSS");
        },

        formatTSB: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "TSB");
            return this.formatEmptyNumber(limitedValue.toFixed(1), options);
        },

        formatEnergy: function(value, options)
        {
            var limitedValue = adjustFieldRange(Number(value), "energy");
            var formattedValue = this.formatInteger(limitedValue);
            return this.formatEmptyNumber(formattedValue, options);
        },

        parseEnergy: function(value, options)
        {
            var limitedValue = adjustFieldRange(value, "energy");
            return this.parseInteger(limitedValue);
        },

        formatTorque: function(value, options)
        {
            var parameters = {
                value: Number(value),
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
            return this.formatEmptyNumber(threeSigFig(adjustedValue), options);
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
            
            var parsedValue = Number(value);

            if (_.isNaN(parsedValue))
                return options && options.hasOwnProperty("defaultValue") ? options.defaultValue : "";
            else
                return parsedValue.toFixed(1);
        },

        formatPowerBalance: function(value, options)
        {
            var parsedValue = (Number(value) * 100).toFixed(1);

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
            return convertToViewUnits(Number(value), "efficiencyfactor", undefined, this.getMySportType(options));
        },

        formatCalories: function(value, options)
        {
            var numValue = Number(value);
            var limitedValue = adjustFieldRange(numValue, "calories");
            var formattedValue = this.formatInteger(limitedValue, options, 0);
            return this.formatEmptyNumber(formattedValue, options);
        },

        parseCalories: function(value, options)
        {
            var intValue = this.parseInteger(value, options);
            intValue = adjustFieldRange(intValue, "calories");
            return intValue;               
        },

        parseHeartRate: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "heartrate");
            return modelValue;
        },

        formatHeartRate: function(value, options)
        {
            var adjustedValue = adjustFieldRange(Number(value), "heartrate");
            return this.formatInteger(adjustedValue, options);
        },

        parseCadence: function(value, options)
        {
            var modelValue = this.parseInteger(value, options);
            modelValue = adjustFieldRange(modelValue, "cadence");
            return modelValue;
        },

        formatCadence: function(value, options)
        {
            var adjustedValue = adjustFieldRange(Number(value), "cadence");
            return this.formatInteger(adjustedValue, options);
        },

        formatEmptyNumber: function(value, options, defaultValue)
        {

            if(options && options.hasOwnProperty("defaultValue"))
            {
                defaultValue = options.defaultValue;
            }
           
            if(_.isUndefined(defaultValue))
            {
                defaultValue = "";
            }

            if(_.isNaN(value) || _.isNaN(Number(value)) || _.isUndefined(value) || _.isNull(value))
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
            return this.formatNumber(adjustedValue, options);
        },

        formatKg: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "kg");
            var adjustedValue = adjustFieldRange(convertedValue, "kg");
            return this.formatNumber(adjustedValue, options);
        },
        
        formatMl: function(value, options)
        {
            var convertedValue = convertToViewUnits(Number(value), "ml");
            var adjustedValue = adjustFieldRange(convertedValue, "ml");
            return this.formatNumber(adjustedValue, options);
        },

        /*
            options:
                defaultValue
                workoutTypeId
        */
        formatUnitsValue: function(units, value, options)
        {
            switch(units)
            {
                case "elevation":
                    return this.formatElevation(value, options);

                case "groundControl":
                    return this.formatGroundControl(value, options);

                case "elevationGain":
                    return this.formatElevationGain(value, options);

                case "elevationLoss":
                    return this.formatElevationLoss(value, options);

                case "speed":
                    return this.formatSpeed(value, options);

                case "pace":
                    return this.formatPace(value, options);

                case "power":
                    return this.formatPower(value, options);

                case "torque":
                    return this.formatTorque(value, options);

                case "energy":
                    return this.formatEnergy(value, options);
                    
                case "heartrate":
                    return this.formatHeartRate(value, options);

                case "duration":
                    return this.formatDuration(value, options);

                case "distance":
                    return this.formatDistance(value, options);

                case "number":
                    return this.formatNumber(value, options);

                case "temperature":
                    return this.formatTemperature(value, options);

                case "if":
                    return this.formatIF(value, options);

                case "tss":
                    return this.formatTSS(value, options);

                case "tsb":
                    return this.formatTSB(value, options);

                case "cm":
                    return this.formatCm(value, options);

                case "kg":
                    return this.formatKg(value, options);

                case "ml":
                    return this.formatMl(value, options);

                case "mmHg":
                    if(_.isArray(value))
                    {
                        return _.map(value, function(val) { return this.formatInteger(val, options); }, this).join("/");
                    }
                    else
                    {
                        return this.formatInteger(value, options);
                    }
                    break;

                case "%":
                case "hours":
                case "kcal":
                case "mg/dL":
                case "mm":
                    return this.formatNumber(value, options);

                case "none":
                    return this.formatInteger(value, options);

                default:
                    throw new Error("Unsupported units for conversion.formatUnitsValue: " + units);
            }
        },

        parseUnitsValue: function(units, value, options)
        {
            switch(units)
            {
                case "elevation":
                    return this.parseElevation(value, options);

                case "speed":
                    return this.parseSpeed(value, options);

                case "pace":
                    return this.parsePace(value, options);

                case "duration":
                    return this.parseDuration(value, options);

                case "distance":
                    return this.parseDistance(value, options);

                case "number":
                    return this.parseNumber(value, options);

                case "cm":
                    return this.parseCm(value, options);

                default:
                     new Error("Unsupported units for conversion.formatUnitsValue: " + units);
            }
        }
         
    };

});
