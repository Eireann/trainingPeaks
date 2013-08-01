define(
[
    "handlebars"
],
function(Handlebars)
{
    var everyOther = function (index, amount, scope)
    {
        if (index % amount)
        {
            return scope.fn(this);
        }
        else
        {
            return scope.inverse(this);
        }
    };

    Handlebars.registerHelper("everyOther", everyOther);
    return everyOther;
});