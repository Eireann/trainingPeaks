define(
[
    "utilities/athlete/userTypes"
],
function (userTypeUtilities)
{
    return function ()
    {
        // check whether the mars app is defined and google analytics is loaded
        if(typeof theMarsApp === "undefined" || typeof window.ga === "undefined")
            return;

        if (arguments.length === 2 && typeof arguments[1] === "object" && arguments[1].hitType === "event")
        {
            var userType = userTypeUtilities.getNameById(theMarsApp.user.getAccountSettings().get("userType"));
            var userHash = theMarsApp.user.get("userIdentifierHash");

            arguments[1].dimension1 = userType;
            arguments[1].dimension2 = userHash;
            arguments[1].dimension3 = theMarsApp.fullScreenManager.isFullScreen();
        }
    
        if (window.ga !== "undefined" && typeof window.ga === "function")
        {
            window.ga.apply(this, arguments); 
        }
    };
});
