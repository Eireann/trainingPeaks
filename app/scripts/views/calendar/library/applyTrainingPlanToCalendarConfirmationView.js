define(
[
    "TP",
    "moment",
    "views/calendar/library/trainingPlanApplyView",
    "views/userConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanToCalendarConfirmation",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView"
],
function(TP, moment, TrainingPlanApplyView, UserConfirmationView, applyTrainingPlanTemplate, trainingPlanErrorTemplate)
{
    return TP.ItemView.extend(
    {

        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "applyTrainingPlanToCalendarConfirmation",

        events:
        {
            'click #confirmationCancel' : 'close'
        },

        template:
        {
            type: "handlebars",
            template: applyTrainingPlanTemplate
        },

        initialize: function(options)
        {
            if (!(options.model && options.targetDate))
            {
                throw "A model and targetDate are required";
            }
            this.model = options.model;
            this.targetDate = options.targetDate;
            this.detailDataPromise = this.model.details.fetch();
            this.detailDataPromise.done(this.render);
        },

        onRender: function ()
        {
            this.renderPlanApplyView();
        },

        renderPlanApplyView: function()
        {
            if(this.planApplyView)
            {
                this.planApplyView.close();
            }
            this.planApplyView = new TrainingPlanApplyView({model: this.model, parentModal: this, defaultDate: this.targetDate});
            this.listenTo(this.planApplyView, "planApplied", this._refreshCalendar);
            this.$(".chooseDate").append(this.planApplyView.render().$el);
            this.on("close", this.planApplyView.close, this.planApplyView);
        },

        _refreshCalendar: function()
        {
            this.close();
            theMarsApp.calendarManager.reset();
        }

    });
});
