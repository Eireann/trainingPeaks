require(
[
    "jquery",
    "boot"
],
function(
    $,
    boot
)
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
        boot();
    }

});
