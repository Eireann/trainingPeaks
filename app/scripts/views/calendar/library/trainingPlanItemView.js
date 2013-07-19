define(
[
    "TP",
    "hbs!templates/views/calendar/library/trainingPlanItemView"
],
function(TP, trainingPlanItemViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlan",

        attributes: function()
        {
            return {
                "data-TrainingPlanId": this.model.get("planId")
            };
        },

        template:
        {
            type: "handlebars",
            template: trainingPlanItemViewTemplate
        }

    });
});