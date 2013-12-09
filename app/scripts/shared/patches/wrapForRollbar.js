define(
[
    "jquery",
    "underscore",
    "originalSetImmediate"
],
function(
    $,
    _
)
{

    var window = this;

    function wrap(callback) {
        var self = this;
        if(!_.isFunction(callback))
        {
            console.warn("Not wrapping non-function for rollbar", callback);
            return callback;
        }

        return function()
        {
            try
            {
                return callback.apply(self, arguments);
            }
            catch(e)
            {
                if (window._rollbar && !e._rollbared)
                {
                    window._rollbar.push(e);
                }

                if (!e._rollbared)
                {
                    e._rollbared = true;
                    e.message += " (rollbared)";
                }

                throw e;
            }
        };
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
