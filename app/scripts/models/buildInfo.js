define(
[
    "TP"
],
function (TP)
{
    var BuildInfoModel = TP.Model.extend(
    {
        urlRoot: function ()
        {
            return theMarsApp.apiRoot + "/sysinfo/v1/assemblyversion";
        },

        defaults:
        {
            "marsVersion": null,
            "apiVersion": null
        },

        parse: function (response)
        {
            return { apiVersion: response };
        }
    });

    return BuildInfoModel;
});
