define(
[
    "TP",
    "./trainingPlanDetails",
    "models/commands/applyTrainingPlan",
    "models/calendar/calendarDay",
    "views/calendar/library/applyTrainingPlanToCalendarConfirmationView"
],
function (
    TP,
    TrainingPlanDetailsModel,
    ApplyTrainingPlanCommand,
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
        refreshDependencies: function(date)
        {
            this.fetch();
            theMarsApp.calendarManager.reset();
        },
        applyToDate: function(date, startType)
        {
            var command = new ApplyTrainingPlanCommand({
                athleteId: theMarsApp.user.getCurrentAthleteId(),
                planId: this.get('planId'),
                startType: startType,
                targetDate: date
            });
            var def = command.execute();
            var self = this;
            def.done(function()
            {
                self.refreshDependencies(date);
            });
            return def;
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
