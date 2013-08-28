define(
[
    "underscore",
    "originalSetImmediate"
],
function(
    _
)
{
    var window = this;

    function wrap(callback) {
        var self = this;
        return function()
        {
            try
            {
                return callback.apply(self, arguments);
            }
            catch(e)
            {
                window._rollbar && window._rollbar.push(e);
                throw e;
            }
        }
    }

    var originalSetInterval = window.setInterval;
    window.setInterval = function(callback, time) {
        return originalSetInterval.call(this, wrap(callback), time);
    };

    var originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, time) {
        return originalSetTimeout.call(this, wrap(callback), time);
    };

    var originalSetImmediate = window.setImmediate;
    window.setImmediate = function(callback) {
        return originalSetImmediate.call(this, wrap(callback));
    };

    var origCallbacks = $.Callbacks;
    $.Callbacks = function() {
        var callbacks = origCallbacks.apply(this, arguments);
        var origFireWith = callbacks.fireWith;
        callbacks.fireWith = wrap(origFireWith);

        return callbacks;
    };

    return window;
});
