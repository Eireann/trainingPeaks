define(
[
],
function()
{
    var cachedTimezone = new Date().getTimezoneOffset();
    
    return function()
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
            xhr.setRequestHeader("X-Client-Timezone", cachedTimezone);
        });
    };
});