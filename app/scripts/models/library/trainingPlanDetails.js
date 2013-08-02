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
            return theMarsApp.apiRoot + "/plans/v1/plans/" + this.id + "/details";
        },

        defaults:
        {
            author: null,
            dayCount: null,
            description: null,
            eventDate: null,
            eventName: null,
            eventPlan: false,
            forceDate: false,
            workoutCount: null,
            planId: null,
            planStatus: null,
            plannedWorkoutTypeDurations: null,
            title: null,
            planApplications: null,
            hasWeeklyGoals: false,
            startDate: null,
            endDate: null
        }

    });

    return TrainingPlanDetailsModel;
});
