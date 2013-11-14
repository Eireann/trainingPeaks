define(
[
    "handlebars",
    "underscore",
    "TP"
],
function(Handlebars, _, TP)
{
    function formatDollars(amount)
    {
        if(_.isNumber(amount))
        {
            return "$" + amount.toFixed(2);
        }
        else
        {
            return "";
        }
    }

    Handlebars.registerHelper("formatDollars", formatDollars);
    return TP.utils.datetime.format;
});

