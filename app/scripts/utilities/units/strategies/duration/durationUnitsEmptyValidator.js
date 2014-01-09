define(
[
], function(
) {

    return function(value, options)
    {
        return (/^[0-9\:\.\-]+$/).test(value);
    };
});