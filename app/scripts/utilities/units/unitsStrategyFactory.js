define(
[
    "underscore",

    "./strategies/defaultUnitsStrategy",

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

    DefaultUnitsStrategy,

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

    var unitDefinitions = {

        defaults: {
            workoutTypeId: 0,
            strategy: DefaultUnitsStrategy,
            converter: defaultUnitsConverter,
            limiter: defaultUnitsLimiter,
            formatter: threeFiguresFormatter,
            labeler: defaultUnitsLabeler
        },

        numberWithThreeFigures: {
            aliases: ["hours", "calories", "kcal", "mg/dL", "mm"]
        },

        integer: {
            aliases: ["units", "none", "mmHg"],
            formatter: integerFormatter,
            parser: integerParser
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

        power: {
            aliases: ["rightpower"],

            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 9999
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

        tss: {
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