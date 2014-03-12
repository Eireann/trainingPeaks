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

        var createException = function()
        {
            try
            {
                this.undef();
            } catch (e)
            {
                return e;
            }
        };

        var addStack = function(e)
        {
            var backupException = createException();

            if (backupException.stack)
            {
                e.stack = backupException.stack;
            }
            else if (backupException.stacktrace)
            {
                e.stack = backupException.stacktrace;
            }
            else if (backupException.message)
            {
                e.stack = backupException.message;
            }
            else if (e.sourceURL && e.line)
            {
                e.stack = e.sourceURL + ":" + e.line;
            }
        };

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
