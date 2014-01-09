define(
[
], function(
) {

    /*
        options: none
    */

    return function(value, options)
    {
        return Number(parseFloat(value).toFixed(options.precision ? options.precision : 2));
    };

});