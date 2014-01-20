define(
[
    "handlebars",
    "underscore",
    "TP"
],
function (Handlebars, _, TP)
{

    var ifAll = function()
    {
        var args = Array.prototype.slice.call(arguments);

        var options = args.pop();

        if (_.all(args))
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifAll", ifAll);
    return ifAll;
});
