define(
[
       "./app/config.js"
],
function(config)
{

    requirejs(
    [
        "jquery"
    ],
    function($)
    {
            
        function cookiesAreEnabled()
        {
            var cookieEnabled = (navigator.cookieEnabled) ? true : false;

            if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled)
            {
                document.cookie = "testcookie";
                cookieEnabled = (document.cookie.indexOf("testcookie") !== -1) ? true : false;
            }
            return (cookieEnabled);
        }

        // Allow browser detection in CSS... because IE
        $("body").attr("data-useragent", navigator.userAgent);

        if (!cookiesAreEnabled())
        {
            alert("Cookies are disabled in your browser. Please enable your cookie support.");
            document.location.href = "http://howenablecookies.com/";
        }
        else
        {
            requirejs(
            [
                "polyfills/console",
                "utilities/rollbarManager",
                "shared/patches/wrapForRollbar",
                "Backbone.Marionette.Handlebars",
                "TP",
                "app"
            ],
            function(consolePolyfill, RollbarManager, rollbarPatches, bmhbs, TP, MarsApp)
            {
                var theApp = new MarsApp();

                if(window._rollbarEnvironment && window._rollbarEnvironment === 'dummy')
                {
                    RollbarManager.initFakeRollbarToConsole(window._rollbarParams, $, window, document);
                }        
                else if(window._rollbarEnvironment && window._rollbarEnvironment === 'live')
                {
                    RollbarManager.initRollbar(window._rollbarParams, $, window, document);
                }

                //**********************************************************************

                // All navigation that is relative should be passed through the navigate
                // method, to be processed by the router. If the link has a `data-bypass`
                // attribute, bypass the delegation completely.
                $(document).on("click", "a[href]:not([data-bypass])", function(evt)
                {
                    // Get the absolute anchor href.
                    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
                    // Get the absolute root.
                    var root = location.protocol + "//" + location.host + theApp.root;

                    // Ensure the root is part of the anchor href, meaning it's relative.
                    if (href.prop.slice(0, root.length) === root)
                    {
                        // Stop the default event to ensure the link will not cause a page
                        // refresh.
                        evt.preventDefault();

                        // `theApp.history.navigate` is sufficient for all Routers and will
                        // trigger the correct events. The Router's internal `navigate` method
                        // calls this anyways.  The fragment is sliced from the root.
                        theApp.history.navigate(href.attr, true);
                    }
                });

                theApp.start();
            });

        }

    });
});
