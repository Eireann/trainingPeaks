define(
[
],
function ()
{
    var almostOneHundredHours = 99 + (59 / 60) + ((59.99 * 60) / 3600); // 99:59:59.99

    var maximums = {
        duration: almostOneHundredHours,
        pace: almostOneHundredHours,
        speed: 999,
        distance: 999999,
        TSS: 9999,
        calories: 99999,
        elevation: 99999,
        power: 9999,
        torque: 9999,
        cadence: 255,
        heartrate: 255,
        temp: 999
    };

    var minimums = {};

    var adjustFieldRange = function (value, fieldName)
    {

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