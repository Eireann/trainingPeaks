define(
[
    "utilities/threeSigFig",
], function(
    threeSigFig
) {

    /*
        options: none
    */

    return function(value, options)
    {
        return threeSigFig(value);
    };

});