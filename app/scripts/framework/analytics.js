define(
[],
function ()
{
    return function ()
    {
        if (window.ga !== "undefined" && typeof window.ga === "function")
            window.ga.apply(this, arguments);
    };
});