define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    var ifEquals = function(actual, expected, options)
    {

        if (actual === expected)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifEquals", ifEquals);
    return ifEquals;
});