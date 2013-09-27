define(
[
    "underscore"
],
function(_)
{

    var RollbarManager =
    {

        initRollbar: function(_rollbarParams, win, doc)
        {
            this._commonInit(_rollbarParams, win, doc);
            this._loadRollbarJavascript(_rollbarParams, win, doc);
        },

        initFakeRollbarToConsole: function(_rollbarParams, win, doc)
        {
            this._commonInit(_rollbarParams, win, doc); 
            this._pushRollbarToConsole(win);
        },

        _commonInit: function(_rollbarParams, win, doc)
        {
            this._setRollbarParamsOnWindow(_rollbarParams, win);
            this._addErrorHandlerToWindow(win);
            this._addErrorHandlingToJquery($, win, doc); 
        },

        _setRollbarParamsOnWindow: function(_rollbarParams, win)
        {
            _rollbarParams["notifier.snippet_version"] = "2";
            win._rollbar=["3b4e2366466f45e3b643a7d6b901bf0e", _rollbarParams];
            win._ratchet=_rollbar;
        },

        _loadRollbarJavascript: function(_rollbarParams, win, doc)
        {

            var loadRollbarOnLoad = function(){
                var rollbarScriptTag = doc.createElement("script");
                var firstScriptTag =doc.getElementsByTagName("script")[0];
                rollbarScriptTag.src="//d37gvrvc0wt4s1.cloudfront.net/js/1/rollbar.min.js";
                rollbarScriptTag.async=false;
                firstScriptTag.parentNode.insertBefore(rollbarScriptTag, firstScriptTag);
            };

            if(win.addEventListener){
                win.addEventListener("load", loadRollbarOnLoad, false);
            }
            else
            {
                win.attachEvent("onload", loadRollbarOnLoad);
            }
        },

        _addErrorHandlerToWindow: function(win)
        {

            // catch all errors at the window error 
            win.onerror = function(e,u,l){
               
                // if they were already wrapped, skip 
                if(/\(rollbared\)/.test(e)) {
                    return;
                }
               
                // push them to rollbar array or rollbar client
                this._rollbar.push({_t:'uncaught',e:e,u:u,l:l});
            };
        },

        // r = jquery, n = window, e = document
        _addErrorHandlingToJquery: function($, win, doc)
        {
            // why did the jquery snippet have ! in front of it?

            // add jquery notifier version to rollbar params
            var t={"notifier.plugins.jquery.version":"0.0.1"};
            win._rollbar.push({_rollbarParams:t});

            // listen for ajax errors
            $(doc).ajaxError(
                function(r,e,t,u){
                    var o=e.status;
                    var a=t.url;
                    win._rollbar.push({level:"warning",
                                    msg:"jQuery ajax error for url "+a,
                                    jquery_status:o,
                                    jquery_url:a,
                                    jquery_thrown_error:u,
                                    jquery_ajax_error:true});
                }
            );

            var originalJqueryReady=$.fn.ready;
            $.fn.ready= function(callback){
                return originalJqueryReady.call(this,
                              function(){
                                try {
                                    callback();
                                } catch(err) {
                                    win._rollbar.push(err);
                                }
                            }
                        );
            };

            var wrappedFunctionRegistry={};
 
            // replace jquery.on with a wrollbar wrapping version 
            var originalJqueryOn = $.fn.on;
            $.fn.on=function(events,e,t,u,z){

                // wrap a function with a try catch to log errors to rollbar
                var wrapWithRollbar =function(callback){
                    var wrappedFunction=function(){
                        try{
                            return callback.apply(this,arguments);
                        } catch(err){
                            win._rollbar.push(err);
                            return null;
                        }
                    };
                    wrappedFunctionRegistry[callback]=wrappedFunction;
                    return wrappedFunction;
                };

                // figure out which of the jquery.on arguments is the actual callback and wrap it
                if(e&&typeof e==="function")
                {
                    e=wrapWithRollbar(e);
                }
                else if(t&&typeof t==="function")
                {
                    t=wrapWithRollbar(t);
                }
                else if(u&&typeof u==="function")
                {
                    u=wrapWithRollbar(u);
                }

                // call the original jquery.on with the now wrapped callback
                return originalJqueryOn.call(this,events,e,t,u,z);
            };

            // unwrap the wrapped callbacks and call jquery off
            var originalJqueryOff = $.fn.off;
            $.fn.off=function(events,n,e){
                if(n&&typeof n==="function"){
                    n=wrappedFunctionRegistry[n];
                    delete wrappedFunctionRegistry[n];
                }
                else
                {
                    e=wrappedFunctionRegistry[e];
                    delete wrappedFunctionRegistry[e];
                }
                return originalJqueryOff.call(this,events,n,e);
            };
        },

        // logs all rollbars to console, and keeps them in window._rollbar array so we can inspect them
        _pushRollbarToConsole: function(win)
        {
            var logToConsole = function()
            {
                console.log("Rollbar: ");
                console.log(arguments);
            };

            win._rollbar.push = function()
            {
                Array.prototype.push.apply(this, arguments);
                logToConsole(arguments);
            };

            // log anything that was already on rollbar array
            _.each(win._rollbar, function(item)
            {
                logToConsole(item);
            });
        }

    };

    return RollbarManager;
});