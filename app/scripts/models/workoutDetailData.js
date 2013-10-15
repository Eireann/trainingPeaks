define(
[
    "underscore",
    "moment",
    "TP",
    "models/workoutStatsForRange",
],
function (_, moment, TP, WorkoutStatsForRange)
{
    var WorkoutDetailData = TP.APIBaseModel.extend(
    {
        cacheable: false,

        webAPIModelName: "WorkoutDetailData",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "THH:mm:ss",
        longDateFormat: "YYYY-MM-DDTHH:mm:ss",

        initialize: function()
        {
            this.rangeCollections = {};
        },

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.id + "/detaildata";
        },

        defaults:
        {
            "workoutId": null, //x, duh
            "flatSamples": null,
            "rangesStats": null,
            "peakCadences": null,
            "peakHeartRates": null,
            "peakPowers": null,
            "peakSpeeds": null,
            "peakSpeedsByDistance": null,
            "sampleRate": null,
            "totalStats": null,
            "lapsStats": null,
            "meanMaxHeartRates": null,
            "meanMaxPowers": null,
            "meanMaxSpeeds": null
        },

        hasSensorData: function()
        {
            return this.hasLaps() || this.hasSamples();
        },

        hasSamples: function()
        {
            // return this.has("flatSamples.samples") && this.get("flatSamples.samples").length > 0;
            return this.has("flatSamples") && this.get("flatSamples").samples && this.get("flatSamples").samples.length > 0;
        },

        hasLaps: function()
        {
            return this.has("lapsStats") && this.get("lapsStats").length > 1;
        },

        watchForSensorData: function()
        {
            this.on("change:flatSamples", this.triggerSensorDataChange, this);
            this.on("change:lapsStats", this.triggerSensorDataChange, this);
        },

        triggerSensorDataChange: function()
        {
            this.trigger("changeSensorData", this);
        },

        _rangeKeys:
        {
            laps: "lapsStats",
            distance: "peakSpeedsByDistance",
            power: "peakPowers",
            heartrate: "peakHeartRates",
            speed: "peakSpeeds",
            pace: "peakSpeeds",
            cadence: "peakCadences"
        },

        getRangeCollectionFor: function(rangeType)
        {
            var collection = this.rangeCollections[rangeType];
            if(!collection)
            {
                var data = this._getRangeDataFor(rangeType);
                collection = new TP.Collection(data, { model: WorkoutStatsForRange });
                this.rangeCollections[rangeType] = collection;
                this._watchRangeDataFor(rangeType, _.bind(collection.set, collection));
            }
            return collection;

        },

        _getRangeDataFor: function(rangeType, onChange)
        {

            if(rangeType !== "laps")
            {
                // Need to figure out where additional peaks processing belongs
                throw new Error("Only range type of 'laps' is fully supported'");
            }
            var key = this._rangeKeys[rangeType];
            if(!key)
            {
                throw new Error("Unknown range type: " + rangeType);
            }

            var ranges = this.get(key);
            return this._augmentRanges(ranges);

        },

        _watchRangeDataFor: function(rangeType, callback)
        {
            var key = this._rangeKeys[rangeType];
            this.on("change:" + key, function(model, value, options)
            {
                value = this._augmentRanges(value);
                callback(value);
            });

        },

        _augmentRanges: function(ranges)
        {
            var workoutId = this.get("workoutId");
            return _.map(ranges, function(range)
            {
                return _.extend({ workoutId: workoutId, hasLoaded: true }, range);
            });
        }

    });

    return WorkoutDetailData;
});
