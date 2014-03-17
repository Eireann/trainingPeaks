define(
[
    "handlebars"
],
function(Handlebars)
{
    var removeWhitespaceBetweenTags = function(options)
    {
        var html = options.fn(this);

        return html.replace(/>\s+</g, "><");
    };

    Handlebars.registerHelper("removeWhitespaceBetweenTags", removeWhitespaceBetweenTags);
    return removeWhitespaceBetweenTags;
});