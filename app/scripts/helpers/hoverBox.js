define(
[
    "handlebars",
    "utilities/wrapTemplate",
    "hbs!templates/helpers/hoverBox"
],
function(Handlebars, wrapTemplate, hoverBoxTemplate)
{
    function hoverBox()
    {
        var uparrow = false;
        var context = arguments[0];
        var options = arguments[1];
        if (arguments.length === 3)
        {
            options = arguments[2];
            uparrow = (arguments[1] === "uparrow") ? true : false;
        }

        context.uparrow = uparrow;
        return wrapTemplate(context, options.fn, hoverBoxTemplate, "innerHtml");
    }

    Handlebars.registerHelper("hoverBox", hoverBox);
    return hoverBox;
});