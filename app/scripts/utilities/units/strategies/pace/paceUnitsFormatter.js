define(
[
    "underscore",
    "utilities/datetime/format"
], function(
    _,
    DateTimeFormatter
) {

    /*
        options:
            workoutTypeId, 
            userUnits,
            units
    */
    return function(value, options)
    {
        return new DateTimeFormatter(options).decimalMinutesAsTime(value * 60, true);
    };

});