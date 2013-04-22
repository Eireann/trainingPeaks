define(
[
],
function()
{
    var cachedTimezone = new Date().getTimezoneOffset();
    
    return function()
    {
        $(document).ajaxSend(function(event, xhr, settings)
        {
            xhr.setRequestHeader("X-Client-Timezone", cachedTimezone);
        });
    };
});