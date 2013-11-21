define(
[
    "underscore",
    "handlebars",
    "TP",
    "utilities/athlete/userTypes"
],
function (_, Handlebars, TP, userTypes)
{
    var editionTypeHelper = function (userType)
    {
        if (userType === userTypes.getIdByName("Premium Athlete Paid By Coach") || userType === userTypes.getIdByName("Premium Athlete"))
        {
            return "Premium Edition";
        }
        else if (userType === userTypes.getIdByName("Paid Coach") || userType === userTypes.getIdByName("Demo Coach"))
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
        if (userType === userTypes.getIdByName("Demo Coach") || userType === userTypes.getIdByName("Basic Athlete"))
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
        if (upgradeButtonVisible(userType))
        {
            if (userType === userTypes.getIdByName("Demo Coach"))
            {
                return "https://home.trainingpeaks.com/account-professional-edition.aspx?s=859edf69-504e-443a-bd0a-b2c6d095b325";
            }

            if (userType === userTypes.getIdByName("Basic Athlete"))
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
        var userTypeId = theMarsApp.user.getAccountSettings().get("userType");
        return editionTypeHelper(userTypeId);
     
    };

    Handlebars.registerHelper("userType", userTypeHelper);
    return userTypeHelper;
});