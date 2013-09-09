// set immediate that is actually immediate instead of next tick
define([],function()
{

    var setImmediate = function(callback)
    {
        callback();
    };

    global.setImmediate = setImmediate;

    return setImmediate;
});