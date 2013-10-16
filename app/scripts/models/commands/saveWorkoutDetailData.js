define(
[
    "TP"
],
function(TP)
{
    return TP.Model.extend(
    {
        defaults:
        {
            lapsStats: [], // complete array of lapsStats with edits
            channelCuts: null,
            sampleEdits: null,
            applyElevationCorrection: false
        },

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();

            return [theMarsApp.apiRoot, "fitness/v1/athletes", athleteId, "workouts", this.workoutId, "detaildata/edits"].join('/');
        },

        execute: function()
        {
            return this.save();
        }
    });

});