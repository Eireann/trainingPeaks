define(
[
    "underscore",
    "moment",

    "utilities/datetime/format",

    "./strategies/defaultUnitsStrategy",

    "./strategies/defaultUnitsEmptyValidator",
    "./strategies/defaultUnitsConverter",
    "./strategies/defaultUnitsLimiter",
    "./strategies/defaultUnitsLabeler",

    "./strategies/integerParser",
    "./strategies/integerFormatter",
    "./strategies/decimalParser",
    "./strategies/decimalFormatter",
    "./strategies/threeFiguresFormatter",

    "./strategies/duration/durationUnitsParser",
    "./strategies/duration/durationUnitsFormatter",
    "./strategies/duration/durationUnitsEmptyValidator",

    "./strategies/pace/paceUnitsParser",
    "./strategies/pace/paceUnitsConverter",
    "./strategies/pace/paceUnitsFormatter",

    "./strategies/temperature/temperatureUnitsConverter"

], function(
    _,
    moment,

    DateTimeFormatter,

    DefaultUnitsStrategy,

    defaultUnitsEmptyValidator,
    defaultUnitsConverter,
    defaultUnitsLimiter,
    defaultUnitsLabeler,

    integerParser,
    integerFormatter,
    decimalParser,
    decimalFormatter,
    threeFiguresFormatter,

    durationUnitsParser,
    durationUnitsFormatter,
    durationUnitsEmptyValidator,

    paceUnitsParser,
    paceUnitsConverter,
    paceUnitsFormatter,

    temperatureUnitsConverter
) {

    var noOp = function(value){return value;},

    var unitDefinitions = {

        defaults: {
            aliases: ["none"],
            workoutTypeId: 0,
            strategy: DefaultUnitsStrategy,
            converter: defaultUnitsConverter,
            limiter: defaultUnitsLimiter,
            formatter: threeFiguresFormatter,
            labeler: defaultUnitsLabeler
        },

        numberWithThreeFigures: {
            aliases: ["number", "calories", "kcal", "mg/dL", "mm"]
        },

        integer: {
            formatter: integerFormatter,
            parser: integerParser
        },

        bloodPressure: {
            aliases: ["mmHg"],
            min: 0,
            max: 999,
            formatter: function(value, options)
            {
                if(_.isArray(value))
                {
                    return _.map(value, function(val) { return integerFormatter(val, options); }, this).join("/");
                }
                else
                {
                    return integerFormatter(value, options);
                }
            }
        },

        bloodPressureUnits: {
            aliases: ["units"],
            limiter: noOp,
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

            units:
            {
                baseUnits: "cm",
                English: "inch",
                Metric: "cm"
            }
        },

        date: {
            limiter: noOp,
            formatter: function(value, options)
            {
                return new DateTimeFormatter().format(value, options.dateFormat);
            },
            parser: function(value, options)
            {
                return new DateTimeFormatter().parse(value, options.dateFormat);
            }
        },

        distance: {
            min: 0,
            max: 999999,

            units:
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

            units:
            {
                baseUnits: "hours",
                English: "hours",
                Metric: "hours"
            }
        },

        durationMilliseconds: {

            aliases: ["milliseconds", "ms"],

            formatter: durationUnitsFormatter,
            parser: durationUnitsParser,
            emptyValidator: durationUnitsEmptyValidator,

            max: 999, // 999 hours, because ms only come from an uploaded file so no need to limit
            min: 0,

            units:
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

            units:
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

            units:
            {
                baseUnits: "seconds",
                English: "hours",
                Metric: "hours"
            }
        },

        efficiencyFactor: {
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2,

            min: 0,
            max: 99,

            units:
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

            units:
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

            units:
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

            units:
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

            units:
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

            units:
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
            max: 100,

            formatter: function(value)
            {

            }
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

            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 2
        },

        skinFold: {

            aliases: ["thickness", "mm"],

            units:
            {
                baseUnits: "mm",
                English: "mm",
                Metric: "mm"
            }
        },

        speed: {
            min: 0,
            max: 999,

            units:
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

            units:
            {
                baseUnits: "degreesCelsius",
                English: "degreesFahrenheit",
                Metric: "degreesCelsius"
            }
        },

        timeofday: {
            min: 0,
            max: 24,

            formatter: function(value, options)
            {
                return moment(value).format("hh:mm A");
            }
        },

        torque: {
            min: 0,
            max: 9999,

            units:
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

            units:
            {
                baseUnits: "kg",
                English: "pound",
                Metric: "kg"
            }
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