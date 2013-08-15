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
            return theMarsApp.apiRoot + "/plans/v1/plans";
        },

        comparator: function(item)
        {
            return item.get("title") ? item.get("title").replace(/[^a-zA-Z0-9]/g,"").toLowerCase() : item.get("title");
        }
    });
});
