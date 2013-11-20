define(
[
    "handlebars",
    "underscore"
],
function (Handlebars, _)
{

    function linebreaks(string)
    {
        string = Handlebars.Utils.escapeExpression(string);
        string = string.replace(/\n/g, "<br>");
        return new Handlebars.SafeString(string);
    }

    Handlebars.registerHelper("linebreaks", linebreaks);
    return linebreaks;
});

