define(
[
    "underscore",
    "handlebars",
    "TP",
    "utilities/athlete/userTypes"
],
function (_, Handlebars, TP, userType)
{
    var editionTypeHelper = function (userType)
    {
        if (userType === 1 || userType === 4)
        {
            return "Premium Edition";
        }
        else if (userType === 2 || userType === 5)
        {
            return "Coach Edition";
        }
        else
        {
            return "Basic Edition";
        }
    };

    var upgradeButtonVisible = function (userType)
    {
        if (userType === 5 || userType === 6)
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    var upgradeButtonLink = function (userType)
    {
        if (upgradeButtonVisible)
        {
            if (userType === 5)
            {
                return "https://home.trainingpeaks.com/account-professional-edition.aspx?s=859edf69-504e-443a-bd0a-b2c6d095b325";
            }

            if (userType === 6)
            {
                return "https://home.trainingpeaks.com/create-account-personal-edition.aspx?login=true&utm_source=tpflex&utm_medium=trigger&utm_content=premiumfeature&utm_campaign=put";
            }
        }
        else
        {
            return;
        }
    };
    
    var userTypeHelper = function (editionType)
    {
        var userTypeId = theMarsApp.user.get("settings.account.userType");
        return editionTypeHelper(userTypeId);
     
    };

    Handlebars.registerHelper("userType", userTypeHelper);
    return userTypeHelper;
});