define(
[
    "TP"
],
function(TP)
{
    return TP.APIDeepModel.extend(
    {
        webAPIModelName: "Workout",
        idAttribute: "uploadedFileId",
        validateIdAttribute: function () { },

        url: function ()
        {
            return theMarsApp.apiRoot + "/groundcontrol/v1/elevations/" + this.id;
        },
        
        defaults:
        {
            uploadedFileId: null,
            elevations: null,
            min: null,
            max: null,
            avg: null,
            gain: null,
            loss: null
        }
    });
});
