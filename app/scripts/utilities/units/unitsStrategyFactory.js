define(
[
    "underscore",
    "moment",

    "./strategies/defaultUnitsStrategy",

    "./strategies/emptyValidatorZeroIsNotEmpty",
    "./strategies/defaultUnitsConverter",
    "./strategies/defaultUnitsLimiter",
    "./strategies/defaultUnitsLabeler",

    "./strategies/integerParser",
    "./strategies/integerFormatter",
    "./strategies/decimalParser",
    "./strategies/decimalFormatter",
    "./strategies/threeFiguresFormatter",

    "./strategies/date/datetimeUnitsStrategy",

    "./strategies/duration/durationUnitsParser",
    "./strategies/duration/durationUnitsFormatter",
    "./strategies/duration/durationUnitsEmptyValidator",

    "./strategies/pace/paceUnitsParser",
    "./strategies/pace/paceUnitsConverter",
    "./strategies/pace/paceUnitsFormatter",

    "./strategies/temperature/temperatureUnitsConverter",

    "./strategies/text/textStrategy"

], function(
    _,
    moment,

    DefaultUnitsStrategy,

    emptyValidatorZeroIsNotEmpty,
    defaultUnitsConverter,
    defaultUnitsLimiter,
    defaultUnitsLabeler,

    integerParser,
    integerFormatter,
    decimalParser,
    decimalFormatter,
    threeFiguresFormatter,

    DateTimeUnitsStrategy,

    durationUnitsParser,
    durationUnitsFormatter,
    durationUnitsEmptyValidator,

    paceUnitsParser,
    paceUnitsConverter,
    paceUnitsFormatter,

    temperatureUnitsConverter,

    TextStrategy
) {

    var noOpLimiter = function(value){return value;};

    var noOpConverter = {
        convertToViewUnits: function(value){return value;},
        convertToModelUnits: function(value){return value;}
    };

    var arrayLimiter = function(value) {

        if(_.isArray(value))
        {
            return _.map(value, function(val) { return defaultUnitsLimiter(val); });
        }
        else
        {
            return defaultUnitsLimiter(value);
        }

    };

    var unitDefinitions = {

        defaults: {
            aliases: ["none"],
            workoutTypeId: 0,
            emptyValidator: emptyValidatorZeroIsNotEmpty,
            strategy: DefaultUnitsStrategy,
            converter: defaultUnitsConverter,
            limiter: defaultUnitsLimiter,
            formatter: threeFiguresFormatter,
            labeler: defaultUnitsLabeler
        },

        numberWithThreeFigures: {
            aliases: ["number", "calories", "kcal", "mg/dL", "mm", "hoursAsDecimal"]
        },

        integer: {
            formatter: integerFormatter,
            parser: integerParser
        },

        bloodPressure: {
            aliases: ["mmHg"],
            min: 0,
            max: 999,
            converter: noOpConverter,
            limiter: arrayLimiter,
            formatter: function(value, options)
            {
                if(_.isArray(value))
                {
                    return _.map(value, function(val) { return integerFormatter(val, options); }).join("/");
                }
                else
                {
                    return integerFormatter(value, options);
                }
            }
        },

        bloodPressureUnits: {
            aliases: ["units"],
            limiter: noOpLimiter,
            converter: noOpConverter,
            formatter: function(value, options)
            {
                var str = "";
                if(_.isArray(value))
                {
                    str += value[1] + " ";
                    value = value[0];
                }
                str += integerFormatter(value, options);    
                return str;
            }
        },

        cadence: {
            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 255
        },

        calories: {
            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 99999
        },
        
        circumference: {

            aliases: ["cm"],

            min: 0,
            max: 999,

            unitTypes:
            {
                baseUnits: "cm",
                English: "inch",
                Metric: "cm"
            }
        },

        date: {
            strategy: DateTimeUnitsStrategy,
            dateFormat: "YYYY-MM-DD"
        },

        distance: {
            min: 0,
            max: 999999,

            unitTypes:
            {
                baseUnits: "meters",
                English: "miles",
                Metric: "kilometers",

                Swim:
                {
                    English: "yards",
                    Metric: "meters" 
                },

                Rowing:
                {
                    English: "meters",
                    Metric: "meters" 
                }
            }
        },

        duration: {

            aliases: ["hours"],

            formatter: durationUnitsFormatter,
            parser: durationUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            max: 99 + (59 / 60) + (59 / 3600), // 99:59:59
            min: 0,

            unitTypes:
            {
                baseUnits: "hours",
                English: "hours",
                Metric: "hours"
            }
        },

        durationAsInteger: {

            aliases: ["hoursAsInteger"],

            formatter: integerFormatter,
            parser: integerParser,

            max: 99 + (59 / 60) + (59 / 3600), // 99:59:59
            min: 0,

            unitTypes:
            {
                baseUnits: "hours",
                English: "hours",
                Metric: "hours"
            }
        },

        durationMilliseconds: {

            aliases: ["milliseconds", "ms", "time"],

            formatter: durationUnitsFormatter,
            parser: durationUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            max: 999, // 999 hours, because ms only come from an uploaded file so no need to limit
            min: 0,

            unitTypes:
            {
                baseUnits: "milliseconds",
                English: "hours",
                Metric: "hours"
            }
        },

        durationMinutes: {

            aliases: ["minutes"],

            formatter: durationUnitsFormatter,
            parser: durationUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            max: (99 + (59 / 60) + (59 / 3600)), // 99:59:59
            min: 0,

            unitTypes:
            {
                baseUnits: "minutes",
                English: "hours",
                Metric: "hours"
            },

            seconds: false // for duration formatter
        },

        durationSeconds: {

            aliases: ["seconds"],

            formatter: durationUnitsFormatter,
            parser: durationUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            max: (99 + (59 / 60) + (59 / 3600)), // 99:59:59
            min: 0,

            unitTypes:
            {
                baseUnits: "seconds",
                English: "hours",
                Metric: "hours"
            }
        },

        efficiencyFactor: {

            aliases: ["ef"],
            
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2,

            min: 0,
            max: 999,

            unitTypes:
            {
                baseUnits: "efficiencyFactorRaw",
                English: "efficiencyFactorRaw",
                Metric: "efficiencyFactorRaw",

                Run:
                {
                    English: "efficiencyFactorEnglish",
                    Metric: "efficiencyFactorMetric"
                },

                Walk:
                {
                    English: "efficiencyFactorEnglish",
                    Metric: "efficiencyFactorMetric"
                }

            }
        },

        elevation: {

            aliases: ["groundControl"],

            formatter: integerFormatter,
            parser: integerParser,

            min: -15000,
            max: 99999,

            unitTypes:
            {
                baseUnits: "meters",
                English: "feet",
                Metric: "meters"
            }
        },

        elevationGain: {
            formatter: integerFormatter,
            parser: integerParser,

            min: 0,
            max: 99999,

            unitTypes:
            {
                baseUnits: "meters",
                English: "feet",
                Metric: "meters"
            }
        },

        elevationLoss: {
            formatter: integerFormatter,
            parser: integerParser,

            min: 0,
            max: 99999,

            unitTypes:
            {
                baseUnits: "meters",
                English: "feet",
                Metric: "meters"
            }
        },

        energy: {
            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 99999
        },

        fluid: {

            aliases: ["ml"],

            unitTypes:
            {
                baseUnits: "ml",
                English: "oz",
                Metric: "ml"
            }
        },

        grade: {
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 1,

            min: -999,
            max: 999
        },

        heartrate: {
            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 255
        },

        "if": {
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2,

            min: 0,
            max: 99
        },

        latitude: {
            aliases: ["lat"],
            min: -90,
            max: 90,
            formatter: function(value, options)
            {
                return (value < 0 ? "S" : "N") + " " + Math.abs(value).toFixed(6);
            }
        },

        longitude: {
            aliases: ["lng"],
            min: -180,
            max: 180,
            formatter: function(value, options)
            {
                return (value < 0 ? "W" : "E") + " " + Math.abs(value).toFixed(6);
            }
        },
                    
        pace: {

            converter: paceUnitsConverter,
            formatter: paceUnitsFormatter,
            parser: paceUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            min: 1 / (60 * 60), // 00:00:01
            max: 99 + (59 / 60) + (59 / 3600), // 99:59:59

            unitTypes:
            {
                baseUnits: "metersPerSecond",
                English: "mph", // formatted as minutes per mile
                Metric: "kph", // formatted as minutes per km

                Swim:
                {
                    English: "secondsPerHundredYards",
                    Metric: "secondsPerHundredMeters" 
                },

                Rowing:
                {
                    English: "secondsPerHundredMeters",
                    Metric: "secondsPerHundredMeters" 
                }
            }
        },

        percent: {
            aliases: ["%"],

            min: 0,
            max: 100
        },

        power: {
            aliases: ["rightpower"],

            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 9999
        },

        powerbalance: {

            min: 0,
            max: 1,

            formatter: function(value, options)
            {
                var rightPower = value * 100;
                var leftPower = 100 - rightPower;
                return threeFiguresFormatter(leftPower, options) + "% / " + threeFiguresFormatter(rightPower, options) + "%";
            }
        },

        powerPulseDecoupling: {
            aliases: ["pwhr", "pwHr", "pw:hr"],

            min: -999,
            max: 999,

            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2
        },

        skinFold: {

            aliases: ["thickness", "mm"],

            unitTypes:
            {
                baseUnits: "mm",
                English: "mm",
                Metric: "mm"
            }
        },

        speed: {
            min: 0,
            max: 999,

            unitTypes:
            {
                baseUnits: "metersPerSecond",
                English: "mph",
                Metric: "kph",

                Swim:
                {
                    English: "yardsPerMinute",
                    Metric: "metersPerMinute" 
                },

                Rowing:
                {
                    English: "metersPerMinute",
                    Metric: "metersPerMinute" 
                }
            }

        },

        speedPulseDecoupling: {
            aliases: ["pahr", "paHr", "pa:hr"],

            min: -999,
            max: 999,

            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2
        },

        temperature: {
            min: -999,
            max: 999,

            formatter: integerFormatter,
            parser: integerParser,
            converter: temperatureUnitsConverter,

            unitTypes:
            {
                baseUnits: "degreesCelsius",
                English: "degreesFahrenheit",
                Metric: "degreesCelsius"
            }
        },

        timeofday: {
            strategy: DateTimeUnitsStrategy,
            dateFormat: "hh:mm A"
        },

        torque: {
            min: 0,
            max: 9999,

            unitTypes:
            {
                baseUnits: "newtonMeters",
                English: "inchPounds",
                Metric: "newtonMeters"
            }
        },

        tsb: {
            aliases: ["TSB"],
            
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 1,

            min: -9999,
            max: 9999
        },

        tss: {
            aliases: ["TSS"],

            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 1,

            min: 0,
            max: 9999
        },

        weight: {

            aliases: ["kg"],
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 1,

            unitTypes:
            {
                baseUnits: "kg",
                English: "pound",
                Metric: "kg"
            }
        },

        text: {
            strategy: TextStrategy
        }

    };

    return {

        buildStrategyForUnits: function(units, options)
        {
            var unitDefinition = this._findUnitDefinition(units);
            if(unitDefinition)
            {

                var strategyOptions = {};
                _.defaults(strategyOptions, options, unitDefinition, unitDefinitions.defaults);

                if(!strategyOptions.userUnits)
                {
                    strategyOptions.userUnits = theMarsApp.user.getUnitsBySportType(strategyOptions.workoutTypeId);
                }

                return new strategyOptions.strategy(strategyOptions);
            }
            else
            {
                throw new Error("Unknown units for unitsStrategyFactory: " + units);
            }
        },

        _findUnitDefinition: function(units)
        {
            if(unitDefinitions.hasOwnProperty(units))
            {
                return unitDefinitions[units];
            }
            else
            {
                return _.find(unitDefinitions, function(unitDefinition)
                {
                    return _.has(unitDefinition, "aliases") && _.contains(unitDefinition.aliases, units);
                });
            }
        }

    };

});