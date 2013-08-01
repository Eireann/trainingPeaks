define(
[
    "handlebars",
    "TP"
],
function (Handlebars, TP)
{

    var ifAny = function()
    {
        var args = Array.prototype.slice.call(arguments);

        var options = args.pop();

        if (_.some(args))
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifAny", ifAny);
    return ifAny;
});