define(
[
], function(
) {

    /*
        options: precision
    */

    return function(value, options)
    {
        return Number(value).toFixed(options.precision ? options.precision : 2);
    };

});