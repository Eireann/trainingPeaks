define(
[
    "TP"
],
function (TP)
{
    var ShortUrlModel = TP.Model.extend(
    {
        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var workoutId = this.get("workoutId");
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + workoutId + "/shorturl";
        },

        defaults:
        {
            "url": null
        },

        initialize: function ()
        {
            if (!this.has("workoutId"))
                throw "no workoutid defined";
        },

        parse: function (response)
        {
            return { url: response };
        }
    });

    return ShortUrlModel;
});
