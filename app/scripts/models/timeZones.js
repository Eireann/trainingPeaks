define(
[
    "TP"
],
function (TP)
{
    var TimeZonesModel = TP.Model.extend(
    {
        urlRoot: function ()
        {
            return theMarsApp.apiRoot + "/sysinfo/v1/timezoneswithlabels";
        },

        defaults:
        {
            "marsVersion": null,
            "apiVersion": null
        },

        parse: function (response)
        {
            return { zonesWithLabels: response };
        }
    });

    return TimeZonesModel;
});
