define(
[
    "underscore",
    "TP"
],
function(_, TP)
{
    var WorkoutStatsForRange = TP.Model.extend(
    {
        cacheable: true,

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/stats/" + this.get("begin") + "/" + this.get("end");
        },

        initialize: function(attrs)
        {
            if (!this.has("workoutId"))
                throw new Error("workoutId is required for WorkoutStatsForRange");

            if (!this.has("begin"))
                throw new Error("begin is required for WorkoutStatsForRange");

            if (!this.has("end"))
                throw new Error("end is required for WorkoutStatsForRange");

            if(attrs.hasOwnProperty("hasLoaded"))
            {
                this.getState().set("hasLoaded", attrs.hasLoaded);
                delete attrs.hasLoaded;
            }

            this._augmentData();
            this.on("change", this._augmentData, this);

        },

        parse: function(response)
        {
            if (this.has("name"))
            {
                response.name = this.get("name");
            }
            return response;
        },

        fetch: function(options)
        {
            return TP.Model.prototype.fetch.call(this, options).done(_.bind(function(){ this.getState().set("hasLoaded", true); }, this));
        },

        _augmentData: function()
        {
            var elapsedTime = this.get("elapsedTime");
            var stoppedTime = this.get("stoppedTime");
            this.set("movingTime", TP.utils.datetime.convert.millisecondsToDecimalHours(elapsedTime - stoppedTime));
            this.set("totalTime", TP.utils.datetime.convert.millisecondsToDecimalHours(elapsedTime));

            if (stoppedTime > 0)
            {
                this.set("hasStoppedTime", true);
            }
        }

    });

    return WorkoutStatsForRange;
});
