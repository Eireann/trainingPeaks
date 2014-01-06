define(
[
    "utilities/datetime/datetime"
], function(
    datetimeUtils
) {

    return function(value, options)
    {
        return datetimeUtils.convert.timeToDecimalHours(value);
    };
});