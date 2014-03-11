define(
[
    "underscore",
    "handlebars",
    "TP"
],
function(_, Handlebars, TP)
{
    var ifUserIsNotPremium = function(workout, options)
    {
        var isNotPremium = !theMarsApp.user.get("userType") || _.contains([5, 6], theMarsApp.user.get("userType"));

        if (isNotPremium)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifUserIsNotPremium", ifUserIsNotPremium);
    return ifUserIsNotPremium;
});