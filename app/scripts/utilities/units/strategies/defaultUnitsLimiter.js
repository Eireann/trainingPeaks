define(
[
    "underscore"
], function(
    _
) {

    /*
        options:
            min
            max
    */
    return function(value, options)
    {
        var numValue = parseFloat(value);

        if (isNaN(numValue))
        {
            return value;
        }
        else
        {
            var min = _.has(options, "min") ? options.min : 0;
            var max = _.has(options, "max") ? options.max : numValue;

            if(numValue < min)
            {
                return min;
            } else if(numValue > max)
            {
                return max;
            } else
            {
                return value;
            }
        }
    };

});