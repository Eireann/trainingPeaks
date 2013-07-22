define(
[
    "handlebars",
    "utilities/wrapTemplate",
    "hbs!templates/helpers/hoverBox"
],
function(Handlebars, wrapTemplate, hoverBoxTemplate)
{
    /*
    Wraps your template content in templates/helpers/hoverBox.html
    usage:
    {{#hoverBox this }}<div>my inner content</div>{{/hoverBox}} == hover box with a bottom arrow
    {{#hoverBox this "uparrow" }}<div>my inner content</div>{{/hoverBox}} == hover box with a top arrow
    {{#hoverBox this "leftarrow" }}<div>my inner content</div>{{/hoverBox}} == hover box with a left arrow
    {{#hoverBox this "rightarrow" }}<div>my inner content</div>{{/hoverBox}} == hover box with a right arrow
    */
    function hoverBox()
    {
        var uparrow, leftarrow, rightarrow = false;
        var context = arguments[0];
        var options = arguments[1];
        if (arguments.length === 3)
        {
            options = arguments[2];
            uparrow = (arguments[1] === "uparrow") ? true : false;
            leftarrow = (arguments[1] === "leftarrow") ? true : false;
            rightarrow = (arguments[1] === "rightarrow") ? true : false;
        }

        context.uparrow = uparrow;
        context.leftarrow = leftarrow;
        context.rightarrow = rightarrow;
        return wrapTemplate(context, options.fn, hoverBoxTemplate, "innerHtml");
    }

    Handlebars.registerHelper("hoverBox", hoverBox);
    return hoverBox;
});