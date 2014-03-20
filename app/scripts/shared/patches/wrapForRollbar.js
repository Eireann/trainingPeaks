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

        var parseChromeException = function(e)
        {
            return (e.stack + '\n')
                .replace(/^[\s\S]+?\s+at\s+/, ' at ')
                .replace(/^\s+(at eval )?at\s+/gm, '')
                .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
                .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
                .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(0, -1);
        };

        var parseSafariException = function(e)
        {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        };

        var parseIeException = function(e)
        {
            return e.stack
                .replace(/^\s*at\s+(.*)$/gm, '$1')
                .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
                .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(1);
        };

        var parseFirefoxException = function(e)
        {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
                .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
                .split('\n');
        };

        var parseOpera11Exception = function(e)
        {
            var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        };

        var parseOpera10bException = function(e)
        {
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                
                if (match) {
                    var fnName = match[1] ? (match[1] + '()') : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        };

        var parseOpera10aException = function(e)
        {
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        };

        var parseOpera9Exception = function(e)
        {
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        };

        var parseOtherException = function(curr)
        {
            var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
            var slice = Array.prototype.slice;
            
            while (curr && curr['arguments'] && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                args = slice.call(curr['arguments'] || []);
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                
                try {
                    curr = curr.caller;
                } catch (e) {
                    stack[stack.length] = '' + e;
                    
                    break;
                }
            }
            
            return stack;
        };

        // This function will never be called if e.stack exists (in live), yet it considers e.stack in its search.
        // Clean up later if we find the approach is viable.
        var findStackAnywhere = function(e)
        {
            // Rollbar cares only about e.stack, so make sure we assign whatever we can scramble to that property.
            // We have nothing to lose since e.stack is either null or undefined to begin with.

            if (e['arguments'] && e.stack)
            {
                e.stack = parseChromeException(e);
            }
            else if (e.stack && e.sourceURL)
            {
                e.stack = parseSafariException(e);
            }
            else if (e.stack && e.number)
            {
                e.stack = parseIeException(e);
            }
            else if (e.stack && e.fileName)
            {
                e.stack = parseFirefoxException(e);
            }
            else if (e.message && e['opera#sourceloc'])
            {
                if (!e.stacktrace)
                {
                    e.stack = parseOpera9Exception(e);
                }
                else if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length)
                {
                    // If e.message has more frames than e.stacktrace, prefer e.message.
                    e.stack = parseOpera9Exception(e);
                }
                else 
                {
                    e.stack = parseOpera10aException(e);
                }
            }
            else if (e.message && e.stack && e.stacktrace)
            {
                if (e.stacktrace.indexOf("called from line") < 0)
                {
                    e.stack = parseOpera10bException(e);
                }
                else
                {
                    e.stack = parseOpera11Exception(e);
                }
            }
            else if (e.stack && !e.fileName)
            {
                e.stack = parseChromeException(e);
            }
            else
            {
                e.stack = parseOtherException(e);
            }

            if (e.stack)
            {
                // Flatten to a human-readable string

                var stack = "";

                _.each(e.stack, function(frame)
                {
                    stack += "\t" + frame + "\n";
                });

                e.stack = (e.name ? e.name + ": " : "") + e.message + "\n" + stack;
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
                // Last resort attempt to collect a stack...
                // If e.stack is null or undefined, see if we can find a stack in any other place.
                // If e.stack exists, leave it alone.
                if (!e.stack)
                {
                    findStackAnywhere(e);
                }

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
