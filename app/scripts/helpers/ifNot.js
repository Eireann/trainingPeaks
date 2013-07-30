define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    var ifNot = function(value, options)
    {
        if (!value)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifNot", ifNot);
    return ifNot;
});