define(
[
    "TP"
],
function(TP)
{
    return TP.DeepModel.extend(
    {
        // easiest way to get backbone to PUT instead of POST
        isNew: function()
        {
            return false;
        },

        url: function()
        {
            var accountSettingsUrl = "users/v1/user/" + theMarsApp.user.id + "/settings/account";
            return theMarsApp.apiRoot + "/" + accountSettingsUrl;
        }

    });
});