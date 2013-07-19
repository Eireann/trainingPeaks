define(
[
    "TP",
    "./trainingPlan"
],
function(TP, TrainingPlanModel)
{
    return TP.Collection.extend(
    {
        model: TrainingPlanModel,
        cacheable: true,

        url: function()
        {
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + theMarsApp.user.getCurrentAthleteId();
        }

    });
});