define(
[
    "handlebars",
    "hbs!templates/helpers/hoverBox"
],
function(Handlebars, hoverBoxTemplate)
{

    function hoverBox(context, options)
    {
        var innerHtml = options.fn(context);
        return hoverBoxTemplate({ innerHtml: innerHtml });
    }
    Handlebars.registerHelper("hoverBox", hoverBox);
    return hoverBox;
});