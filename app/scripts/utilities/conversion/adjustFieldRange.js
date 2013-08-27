define(
[
],
function ()
{
    var maximums = {
        duration: 99 + (59 / 60) + (59 / 3600), // 99:59:59
        pace: 99 + (59 / 60) + (59 / 3600), // 99:59:59
        speed: 999,
        distance: 999999,
        TSS: 9999,
        TSB: 9999,
        calories: 99999,
        elevationGain: 99999,
        elevationLoss: 99999,
        elevation: 99999,
        power: 9999,
        torque: 9999,
        cadence: 255,
        heartrate: 255,
        temp: 999,
        IF: 99,
        energy: 99999,
        cm: 999
    };

    var minimums = {
        pace: 1 / (60 * 60),
        elevation: -15000,
        temp: -999,
        TSB: -9999
    };

    var adjustFieldRange = function (value, fieldName)
    {

        value = parseFloat(value);

        if (isNaN(value) || !fieldName)
        {
            return value;
        }
        else
        {
            var min = minimums.hasOwnProperty(fieldName) ? minimums[fieldName] : 0;
            var max = maximums.hasOwnProperty(fieldName) ? maximums[fieldName] : value;

            if(value < min)
            {
                return min;
            } else if(value > max)
            {
                return max;
            } else
            {
                return value;
            }
        }
    };

    return adjustFieldRange;

});