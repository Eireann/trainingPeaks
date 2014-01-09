define(
[
    "utilities/datetime/datetime"
], function(
    datetimeUtils
) {

    return function(value, options)
    {

        var sportType = options.workoutTypeId || 0;
        var assumeSeconds = sportType === 1 || sportType === 12; // Swim or Rowing

        // assume that a pace time is in minutes or seconds, not hours, unless explicitly formatted
        var paceInHours = datetimeUtils.convert.timeToDecimalHours(value, { assumeHours: false, assumeSeconds: assumeSeconds });

        return paceInHours;
    };

});