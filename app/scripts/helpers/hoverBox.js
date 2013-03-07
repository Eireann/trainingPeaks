define(
[
    "handlebars",
    "utilities/wrapTemplate",
    "hbs!templates/helpers/hoverBox"
],
function(Handlebars, wrapTemplate, hoverBoxTemplate)
{
    function hoverBox(context, options)
    {
        return wrapTemplate(context, options.fn, hoverBoxTemplate, "innerHtml");
    }

    Handlebars.registerHelper("hoverBox", hoverBox);
    return hoverBox;
});