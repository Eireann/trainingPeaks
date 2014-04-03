define(
[
    "TP",
    "./trainingPlanDetails"
],
function (
    TP,
    TrainingPlanDetailsModel
)
{
    var TrainingPlanModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "TrainingPlan",
        idAttribute: "planId",

        urlRoot: function()
        {
            return this._getApiRoot() + "/plans/v1/plans";
        },

        defaults:
        {
            planId: null,
            title: null,
            author: null,
            daysDuration: null
        },

        initialize: function(attributes, options)
        {
            this.options = options;
            this.details = new TrainingPlanDetailsModel({ planId: this.get("planId") });
        }

    });

    return TrainingPlanModel;
});
