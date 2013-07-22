define(
[
    "TP"
],
function (TP)
{
    var TrainingPlanModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "TrainingPlan",
        idAttribute: "planId",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + athleteId;
        },

        defaults:
        {
            "planId": null,
            "title": null,
            "planStatus": null,
            "planApplications": null,
            "author": null,
            "dayCount": null,
            "workoutCount": null,
            "plannedWorkoutTypeDurations": null,
            "description": null,
        }
    });

    /*

    planApplications: [
        {startDate, endDate}
    ]

    plannedWorkoutTypeDurations: [
        workoutTypeId,
        duration,
        distance,
        raceDistance
    ]

    */

    return TrainingPlanModel;
});
