define([
    "underscore"
],
function(_)
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

    var roundToThreeSignificantFigures = function(value)
    {
        if (!isNumeric(value))
        {
            return null;
        }

        if (!_.isNumber(value))
        {
            value = Number(value);
        }

        if (value >= 99.95)
        {
            return value.toFixed(0);
        } else if (value >= 9.995)
        {
            return value.toFixed(1);
        } else
        {
            return value.toFixed(2);
        }
    };

    return roundToThreeSignificantFigures;
});
