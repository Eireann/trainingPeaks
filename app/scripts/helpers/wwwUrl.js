define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{
    // wrapping here because handlebars passes extra parameters - like the model context - that confuse the converter
    var wwwUrlHelper = function (urlFragment)
    {
        var baseUrl = theMarsApp.wwwRoot;
        if (urlFragment.indexOf("/") !== 0)
        {
            baseUrl += "/";
        }
        return baseUrl + urlFragment;
    };

    Handlebars.registerHelper("wwwUrl", wwwUrlHelper);
    return wwwUrlHelper;
});