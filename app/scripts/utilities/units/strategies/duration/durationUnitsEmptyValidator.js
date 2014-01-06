define(
[
    "underscore"
], function(
    _ 
) {

    return function(value, options)
    {
        return /^[0-9\:\.\-]+$/.test(value);
    };
});