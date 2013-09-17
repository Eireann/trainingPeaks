define(
[
    "underscore",
    "moment",
    "TP"
],
function(
    _,
    moment,
    TP
)
{

    var MetricModel = TP.APIDeepModel.extend(
    {

        idAttribute: "id",
        webAPIModelName: "Metric",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
        },

        defaults:
        {
            "id": null,
            "athleteId": null,
            "details": [],
            "timeStamp": null
        }

    });

    return MetricModel;

});
