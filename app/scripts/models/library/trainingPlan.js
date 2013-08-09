define(
[
    "TP",
    "./trainingPlanDetails"
],
function (TP, TrainingPlanDetailsModel)
{
    var TrainingPlanModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "TrainingPlan",
        idAttribute: "planId",

        urlRoot: function()
        {
            return theMarsApp.apiRoot + "/plans/v1/plans";
        },

        defaults:
        {
            planId: null,
            title: null,
            author: null
        },

        initialize: function()
        {
            this.details = new TrainingPlanDetailsModel({ planId: this.get("planId") });
        }

    });

    return TrainingPlanModel;
});
