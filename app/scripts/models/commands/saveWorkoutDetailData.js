define(
[
    "underscore",
    "TP"
],
function(_, TP)
{
    var channelIds = {
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

        initialize: function(attributes, options)
        {
            if(!options.workoutId)
            {
                throw new Error("SaveWorkoutDetailDataCommand requires a workout id");
            }
            if(!options.uploadedFileId)
            {
                throw new Error("SaveWorkoutDetailDataCommand requires an uploaded file id");
            }

            this.workoutId = options.workoutId;
            this.uploadedFileId = options.uploadedFileId;
        },

        defaults:
        {
            lapsStats: null, // complete array of lapsStats with edits
            channelCuts: null, // [{ channel: enum, startTimeInMilliseconds: int, endTimeInMilliseconds: int }] 
            sampleEdits: null,
            applyElevationCorrection: false
        },

        urlRoot: function()
        {
            return [
                theMarsApp.apiRoot,
                "fitness/v1/athletes",
                theMarsApp.user.getCurrentAthleteId(),
                "workouts",
                this.workoutId,
                "detaildata",
                this.uploadedFileId,
                "edits"
            ].join('/');
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
                channelCut.channel = this._lookupchannelId(channelCut.channel);
            }, this);
        },

        _lookupchannelId: function(channelName)
        {
            if(!channelName || !channelIds.hasOwnProperty(channelName))
            {
                throw new Error("Unknown channel for channel cut: " + channelName);
            }

            return channelIds[channelName];
        }
    });

});
