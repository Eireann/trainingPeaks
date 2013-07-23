define(
[
    "TP"
],
function (TP)
{
    var TrainingPlanDetailsModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "TrainingPlanDetails",
        idAttribute: "planId",

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + athleteId + "/plans/" + this.id + "/details";
        },

        defaults:
        {
            "author": null,
            "dayCount": null,
            "description": null,
            "workoutCount": null,
            "planId": null,
            "planApplications": null,
            "planStatus": null,
            "plannedWorkoutTypeDurations": null,
            "title": null
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

    return TrainingPlanDetailsModel;
});
