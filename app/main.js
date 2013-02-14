define(
[
    "TP",
    "app"
],
function(TP, theApp)
{
    /*
    * jQuery OAuth Authentication Hack
    * Need to figure out a better place to inject this into jQuery
    * but can't easily make it a separate plugin because I need access to the
    * Router for clean re-routing
    */
    //**********************************************************************
    $(document).ajaxSend(function (event, xhr, settings)
    {
        if (theApp.session.isAuthenticated())
            xhr.setRequestHeader("Authorization", "Bearer " + theApp.session.get("access_token"));

        if (!theApp.isLive())
            window.lastAjaxRequest = { settings: settings, xhr: xhr };
    });

    $(document).ajaxError(function (event, xhr)
    {
        if (xhr.status === 401)
            theApp.trigger("api:unauthorized");
    });

    //**********************************************************************

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    $(document).on("click", "a[href]:not([data-bypass])", function (evt)
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

            // `TP.history.navigate` is sufficient for all Routers and will
            // trigger the correct events. The Router's internal `navigate` method
            // calls this anyways.  The fragment is sliced from the root.
            TP.history.navigate(href.attr, true);
        }
    });

    theApp.start();
    TP.history.start({ pushState: false, root: theApp.root });
});
