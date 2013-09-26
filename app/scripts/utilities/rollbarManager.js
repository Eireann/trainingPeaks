define(
[
    "jquery"
],
function()
{

    var RollbarManager
    {

        initRollbar: function(_rollbarParams, win, doc)
        {
            this._loadRollbarScript(_rollbarParams, win, doc);
            this._addErrorHandlerToWindow(win);
            this._addErrorHandlingToJquery($, win, doc); 
        },

        _loadRollbarScript: function(_rollbarParams, win, doc)
        {
            _rollbarParams["notifier.snippet_version"] = "2";
            win._rollbar=["3b4e2366466f45e3b643a7d6b901bf0e", _rollbarParams];
            win._ratchet=_rollbar;

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
                };
               
                // push them to rollbar array or rollbar client
                this._rollbar.push({_t:'uncaught',e:e,u:u,l:l});
            };
        },

        // r = jquery, n = window, e = document
        _addErrorHandlingToJquery: function(r, n, e)
        {
            // why did the jquery snippet have ! in front of it?

            // add jquery notifier version to rollbar params
            var t={"notifier.plugins.jquery.version":"0.0.1"};
            n._rollbar.push({_rollbarParams:t});

            // listen for ajax errors
            r(e).ajaxError(
                function(r,e,t,u){
                    var o=e.status;
                    var a=t.url;
                    n._rollbar.push({level:"warning",
                                    msg:"jQuery ajax error for url "+a,
                                    jquery_status:o,
                                    jquery_url:a,
                                    jquery_thrown_error:u,
                                    jquery_ajax_error:true});
                }
            );

            var u=r.fn.ready;
            r.fn.ready= function(r){
                return u.call(this,
                              function(){
                                try {
                                    r();
                                } catch(e) {
                                    n._rollbar.push(e);
                                }
                            }
                        );
            };
            var o={};
  
            var a=r.fn.on;

            r.fn.on=function(r,e,t,u,z){
                var f=function(r){
                    var e=function(){
                        try{
                            return r.apply(this,arguments);
                        } catch(e){
                            n._rollbar.push(e);
                            return null;
                        }
                    };
                    o[r]=e;
                    return e;
                };

                if(e&&typeof e==="function")
                {
                    e=f(e);
                }
                else if(t&&typeof t==="function")
                {
                    t=f(t);
                }
                else if(u&&typeof u==="function")
                {
                    u=f(u);
                }

                return a.call(this,r,e,t,u,z);
            };

            var f=r.fn.off;
            r.fn.off=function(r,n,e){
                if(n&&typeof n==="function"){
                    n=o[n];
                    delete o[n];
                }
                else
                {
                    e=o[e];
                    delete o[e];
                }
                return f.call(this,r,n,e);
            };
        } 

    };

    return RollbarManager;
});