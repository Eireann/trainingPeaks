define(
[
    "handlebars"
],
function(Handlebars)
{

    var stripHtml = function(html, maxLength)
    {
        var text = $("<div>").html(html).text();

        if (typeof maxLength !== "undefined" && text.length > maxLength)
        {
            text = text.substr(0, maxLength - 3) + "...";
        }
        return text;
    };

    Handlebars.registerHelper("stripHtml", stripHtml);
    return stripHtml;
});