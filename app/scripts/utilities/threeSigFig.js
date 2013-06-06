define([],
function()
{
    var isNumeric = function(value)
    {
        if (value === null)
        {
            return false;
        }

        if (_.isString(value) && !value.trim())
        {
            return false;
        }

        var asNumber = Number(value);
        return _.isNumber(asNumber) && !_.isNaN(asNumber);
    };

    var roundToThreeSignificantFigures = function(value, precision)
    {
        if (!isNumeric(value))
        {
            return null;
        }

        if (!_.isNumber(value))
        {
            value = Number(value);
        }

        if (_.isNumber(precision))
        {
            return value.toFixed(precision);
        }

        if (value >= 100)
        {
            return Math.round(value);
        } else if (value >= 10)
        {
            return value.toFixed(1);
        } else
        {
            return value.toFixed(2);
        }
    };

    return roundToThreeSignificantFigures;
});