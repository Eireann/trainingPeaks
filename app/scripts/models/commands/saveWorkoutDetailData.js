define(
[
    "TP"
],
function(TP)
{
    var channelEditIds = {
        Nothing: 0,
        MillisecondsOffset: 1,
        Cadence: 2,
        Distance: 4,
        Elevation: 8,
        HeartRate: 16,
        Latitude: 32,
        Longitude: 64,
        Power: 128,
        Speed: 256,
        SpeedCalculated: 512,
        Torque: 1024,
        Temperature: 2048,
        RightPower: 4096,
        RespirationRate: 8192,
        LeftPower: 16384,
        IsEndSampleOfGap: 32768,
        All: 65536,
        AllChannels: 98302
    };
    
    return TP.Model.extend(
    {
        defaults:
        {
            lapsStats: null, // complete array of lapsStats with edits
            channelCuts: null, // [{ channelEdit: enum, startTimeInMilliseconds: int, endTimeInMilliseconds: int }] 
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
            this._setChannelCutIds(this.get("channelCuts"));
            return this.save();
        },

        _setChannelCutIds: function(channelCuts)
        {
            if(!channelCuts || !channelCuts.length)
            {
                return;
            }

            _.each(channelCuts, function(channelCut)
            {
                channelCut.channelEdit = this._lookupChannelEditId(channelCut.channelEdit);
            }, this);
        },

        _lookupChannelEditId: function(channelName)
        {
            if(!channelName || !channelEditIds.hasOwnProperty(channelName))
            {
                throw new Error("Unknown channel for channel cut: " + channelName);
            }

            return channelEditIds[channelName];
        }
    });

});