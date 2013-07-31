define(
[
    "utilities/athlete/userTypes"
],
function (userTypeUtilities)
{
    return function ()
    {
        if (arguments.length === 2 && typeof arguments[1] === "object" && arguments[1].hitType === "event")
        {
            var userType = userTypeUtilities.getNameById(theMarsApp.user.get("settings.account.userType"));
            arguments[1].dimension1 = userType;
        }
        
        if (window.ga !== "undefined" && typeof window.ga === "function")
            window.ga.apply(this, arguments);
    };
});