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

        defaults:
        {
            dateOptions: null,
            pods: null
        },

        url: function()
        {
            var dashboardSettingsUrl = "users/v1/user/" + theMarsApp.user.id + "/settings/dashboard";
            return theMarsApp.apiRoot + "/" + dashboardSettingsUrl;
        }

    });
});