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

        var addStack = function(e)
        {
            // Rollbar won't look in those other places for a potential stack,
            // so give it a push.
            // We have nothing to lose since e.stack is either null or undefined to begin with.
            if (e.stacktrace)
            {
                e.stack = e.stacktrace;
            }
            else if (e.message)
            {
                e.stack = e.message;
            }
        };

        /*
        var addStack = function(arguments, e)
        {
            if (!arguments || !arguments.callee || !arguments.callee.caller)
            {
                return;
            }

            var stack = [];
            
            var f = arguments.callee.caller;
            while (f)
            {
                stack.push(f.name);
                f = f.caller;
            }

            e.stack = stack.join("\n");
        };
        */

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
                    // Last resort attempt to collect a stack:
                    // If e.stack is null or undefined, see if we can scramble something.
                    if (!e.stack)
                    {
                        addStack(e);
                    }

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
