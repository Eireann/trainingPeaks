define(
[
    "handlebars",
    "underscore"
],
function (Handlebars, _)
{

    var forRange = function(start, end, options)
    {
        var html = "";
        for(var i = start; i <= end;  i++)
        {
            html += options.fn(_.defaults({ index: i }, this));
        }
        return html;
    };

    Handlebars.registerHelper("forRange", forRange);
    return forRange;
});