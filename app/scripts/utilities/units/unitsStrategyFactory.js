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
    "./strategies/pace/paceUnitsFormatter"

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
    paceUnitsFormatter
) {

    var defaultUnitOptions = {

        defaults: {
            workoutTypeId: 0,
            strategy: DefaultUnitsStrategy,
            converter: defaultUnitsConverter,
            limiter: defaultUnitsLimiter,
            formatter: threeFiguresFormatter,
            labeler: defaultUnitsLabeler
        },
 
        calories: {
            formatter: integerFormatter,
            parser: integerParser,
            min: 0,
            max: 99999
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

        elevation: {
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

        tss: {
            formatter: decimalFormatter,
            parser: decimalParser,
            precision: 1,

            min: 0,
            max: 9999
        }

    };

    return {

        buildStrategyForUnits: function(units, options)
        {
            if(defaultUnitOptions.hasOwnProperty(units))
            {

                var strategyOptions = {};
                _.defaults(strategyOptions, options, defaultUnitOptions[units], defaultUnitOptions.defaults);

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
        }

    };

});