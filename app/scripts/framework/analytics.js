define(
[
    "utilities/athlete/userTypes"
],
function (userTypeUtilities)
{
    return function ()
    {
        // check whether the mars app is defined and google analytics is loaded
        if(typeof theMarsApp === "undefined" || typeof window.ga !== "undefined")
            return;

        if (arguments.length === 2 && typeof arguments[1] === "object" && arguments[1].hitType === "event")
        {
            var userType = userTypeUtilities.getNameById(theMarsApp.user.getAccountSettings().get("userType"));
            arguments[1].dimension1 = userType;
        }
        
        window.ga.apply(this, arguments);
    };
});