define(
[],
function ()
{
    return function ()
    {
        if (ga !== "undefined" && typeof ga === "function")
            ga.apply(this, arguments);
    };
});