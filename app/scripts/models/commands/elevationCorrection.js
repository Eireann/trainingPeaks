define(
[
    "moment",
    "TP"
],
function(moment, TP)
{
    return TP.Model.extend(
    {
        url: function()
        {
            return theMarsApp.apiRoot + "/groundcontrol/v1/commands/applyelevationstofile/" + this.uploadedFileId;
        },

        defaults:
        {
        },

        initialize: function(attributes, options)
        {
            if (!options.uploadedFileId)
                throw "ElevationCorrectionCommandModel requires an uploadedFileId at construction";

            this.uploadedFileId = options.uploadedFileId;
        },

        execute: function()
        {
            return this.save();
        }
    });

});