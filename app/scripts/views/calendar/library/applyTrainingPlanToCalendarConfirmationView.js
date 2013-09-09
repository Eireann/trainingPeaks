define(
[
    "TP",
    "moment",
    "views/calendar/library/trainingPlanDatePickerView",
    "views/userConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanToCalendarConfirmation",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView"
],
function(TP, moment, TrainingPlanDatePickerView, UserConfirmationView, applyTrainingPlanTemplate, trainingPlanErrorTemplate)
{
    return TP.ItemView.extend(
    {
        initialize: function(options)
        {
            if (!(options.model && options.targetDate))
            {
                throw "A model and targetDate are required";
            }
            this.model = options.model;
            this.targetDate = options.targetDate;
            this.dateView = new TrainingPlanDatePickerView({model: this.model, el: this.$el.find('.chooseDate'), parentModal: this, defaultDate: this.targetDate});
            this.detailDataPromise = this.model.details.fetch();
            this.detailDataPromise.done(this.render);
        },

        onRender: function ()
        {
            this.dateView.setElement(this.$el.find('.chooseDate'));
            this.dateView.render();
        },

        applyPlan: function()
        {
            var self = this;
            if (this.detailDataPromise.state() === "pending")
            {
                return;
            }
            this.$el.addClass('waiting');

            var applyStartType = Number(this.dateView.ui.applyDateType.val());
            var targetDate = this.dateView.ui.applyDate.val();

            var apply = this.model.applyToDate(targetDate, applyStartType);
            var self = this;
            apply.done(function()
            {
                self.close();
            }).fail(function()
            {
                var errorMessageView = new UserConfirmationView({ template: trainingPlanErrorTemplate });
                errorMessageView.render();
                self.$el.removeClass('waiting');
            });
        },

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
            'click #confirmationOk': 'applyPlan',
            'click #confirmationCancel' : 'onCancel'
        },

        onCancel: function()
        {
            this.close();
        },

        template:
        {
            type: "handlebars",
            template: applyTrainingPlanTemplate
        }
    });
});
