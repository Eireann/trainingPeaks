define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    var ifHasKey = function(key, context, options)
    {
        if (context.hasOwnProperty(key))
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifHasKey", ifHasKey);
    return ifHasKey;
});