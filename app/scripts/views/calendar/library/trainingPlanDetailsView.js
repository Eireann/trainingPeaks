define(
[
    "TP",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(TP, trainingPlanDetailsViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlanDetails",
        modal: true,

        attributes: function()
        {
            return {
                "data-TrainingPlanId": this.model.get("planId")
            };
        },

        template:
        {
            type: "handlebars",
            template: trainingPlanDetailsViewTemplate
        }

    });
});