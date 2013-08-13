define(
[
    "handlebars"
],
function(Handlebars)
{

    var multilineEllipsis = function(text, maxLength)
    {
        if (typeof maxLength !== "undefined" && text.length > maxLength)
        {
            text = text.substr(0, maxLength - 3) + "...";
        }
        return text;
    };

    Handlebars.registerHelper("multilineEllipsis", multilineEllipsis);
    return multilineEllipsis;
});