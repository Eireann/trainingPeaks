define(
[
    "underscore",

    "./strategies/defaultUnitsStrategy",

    "./strategies/defaultUnitsConverter",
    "./strategies/defaultUnitsLimiter",
    "./strategies/defaultUnitsFormatter",
    "./strategies/defaultUnitsLabeler"
], function(
    _,
    DefaultUnitsStrategy,
    defaultUnitsConverter,
    defaultUnitsLimiter,
    defaultUnitsFormatter,
    defaultUnitsLabeler
) {

    var defaultUnitOptions = {

        defaults: {
            workoutTypeId: 0,
            converter: defaultUnitsConverter,
            limiter: defaultUnitsLimiter,
            formatter: defaultUnitsFormatter,
            labeler: defaultUnitsLabeler
        },

        distance: {
            unitsName: "distance",
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

        }
    };

    return {

        buildStrategyForUnits: function(units, options)
        {
            if(defaultUnitOptions.hasOwnProperty(units))
            {

                var strategyOptions = {};
                _.defaults(strategyOptions, options, defaultUnitOptions[units], defaultUnitOptions.defaults);

                strategyOptions.userUnits = theMarsApp.user.getUnitsBySportType(strategyOptions.workoutTypeId);

                return new DefaultUnitsStrategy(strategyOptions);
            }
            else
            {
                throw new Error("Unknown units for unitsStrategyBuilder: " + units);
            }
        }

    };

});