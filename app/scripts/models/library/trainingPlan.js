define(
[
    "TP",
    "./trainingPlanDetails",
    "models/calendar/calendarDay",
    "views/calendar/library/applyTrainingPlanToCalendarConfirmationView"
],
function (
    TP,
    TrainingPlanDetailsModel,
    CalendarDay,
    ApplyTrainingPlanToCalendarConfirmationView
)
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
            author: null,
            daysDuration: null
        },

        initialize: function()
        {
            this.details = new TrainingPlanDetailsModel({ planId: this.get("planId") });
        },

        dropped: function(options)
        {
            if(options.target instanceof CalendarDay)
            {
                new ApplyTrainingPlanToCalendarConfirmationView({model: this, targetDate: options.target.id}).render();
            }
        }

    });

    return TrainingPlanModel;
});
