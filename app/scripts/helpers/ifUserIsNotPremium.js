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
        var isNotPremium = _.contains([5, 6], theMarsApp.user.get("settings.account.userType"));

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