define(
[
    "jqueryui/datepicker",
    "TP",
    "models/commands/applyTrainingPlan",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(datepicker, TP, ApplyTrainingPlanCommand, trainingPlanDetailsViewTemplate)
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
        },

        events:
        {
            "click .apply": "onApply"    
        },

        onRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
            });
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = data.planStatus === TP.utils.trainingPlan.getStatusByName("Purchased") ? true : false;
            data.applyDate = moment().format("YYYY-MM-DD");
            return data;
        },

        onApply: function()
        {
            var command = new ApplyTrainingPlanCommand({
                planId: this.model.get("planId"),
                applyDate: this.$("#applyDate").val()
            });

            var self = this;
            command.execute().done(function()
            {
                self.model.collection.fetch();
            });
        }

    });
});