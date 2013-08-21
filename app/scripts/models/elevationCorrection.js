define(
[
    "TP",
    "models/commands/elevationCorrection"
],
function(TP, ElevationCorrectionCommandModel)
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
        initialize: function(options)
        {
            this.elevationCorrectionCommandModel = new ElevationCorrectionCommandModel({}, { uploadedFileId: options.uploadedFileId });
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
        },
        applyCorrection: function()
        {
            var self = this;
            this.elevationCorrectionCommandModel.execute().done(function()
            {
                self.trigger("correctionSaved");
            });
        }
    });
});
