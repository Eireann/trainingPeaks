define(
[
],
function()
{
    return function(app)
    {
        /*
        * jQuery OAuth Authentication Hack
        * Need to figure out a better place to inject this into jQuery
        * but can't easily make it a separate plugin because I need access to the
        * Router for clean re-routing
        */
        //**********************************************************************
        $(document).ajaxSend(function(event, xhr, settings)
        {
            if (app.session.isAuthenticated())
                xhr.setRequestHeader("Authorization", "Bearer " + app.session.get("access_token"));

            if (!app.isLive())
                window.lastAjaxRequest = { settings: settings, xhr: xhr };
        });

        $(document).ajaxError(function(event, xhr)
        {
            if (xhr.status === 401)
            {
                app.trigger("api:unauthorized");
            }
            else if(xhr.status === 402)
            {
                app.trigger("api:paymentrequired");
            }
        });
    };
});