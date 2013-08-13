define(
[
    "handlebars",
    "scripts/helpers/multilineEllipsis"
],
function (Handlebars, multilineEllipsis)
{

    var stripHtml = function(html, maxLength)
    {
        var text = multilineEllipsis($("<div>").html(html).text(), maxLength);

        return text;
    };

    Handlebars.registerHelper("stripHtml", stripHtml);
    return stripHtml;
});