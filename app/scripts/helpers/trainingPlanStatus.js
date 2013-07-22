define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("trainingPlanStatus", TP.utils.trainingPlan.getNameByStatus);
    return TP.utils.trainingPlan.getNameByStatus;
});