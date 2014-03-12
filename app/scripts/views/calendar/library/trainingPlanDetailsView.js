define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "tpcore",
    "utilities/htmlCleaner",
    "models/commands/applyTrainingPlan",
    "models/commands/removeTrainingPlan",
    "views/userConfirmationView",
    "shared/views/tomahawkView",
    "./trainingPlanFullDescriptionView",
    "scripts/helpers/multilineEllipsis",
    "views/calendar/library/trainingPlanDatePickerView",
    "hbs!templates/views/confirmationViews/unapplyConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(
    $,
    _,
    setImmediate,
    TP,
    tpcore,
    htmlCleaner,
    ApplyTrainingPlanCommand,
    RemoveTrainingPlanCommand,
    UserConfirmationView,
    TomahawkView,
    trainingPlanFullDescriptionView,
    multilineEllipsis,
    TrainingPlanDatePickerView,
    deleteConfirmationTemplate,
    trainingPlanErrorTemplate,
    trainingPlanDetailsViewTemplate
    )
{
    var TrainingPlanDetailsView = TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlanDetails",
        dateFormat: "M/D/YYYY",
        applyStartType: TP.utils.trainingPlan.startTypeEnum.StartDate,

        template:
        {
            type: "handlebars",
            template: trainingPlanDetailsViewTemplate
        },

        events:
        {
            "click .apply": "onApply",
            "click #closeIcon": "close",
            "click .removePlan": "confirmDeleteAppliedPlan",
            "click .more": "moreClicked"
        },

        ui: {
            dateSection: ".startEndPlan"
        },

        initialize: function()
        {
            this.model.details.on("change", this.render, this);
            this.once("render", this.onInitialRender, this);
            this.dateView = new TrainingPlanDatePickerView({model: this.model, el: this.$el.find('.startEndPlan'), parentModal: this});
        },

        onInitialRender: function()
        {
            this.waitingOn();
            var self = this;
            this.model.details.fetch().done(function() 
            {
                self.waitingOff(); 
            });
        },

        onClose: function()
        {
            this.model.details.off("change", this.render, this);
        },

        onRender: function()
        {
            var self = this;
            this.dateView.setElement(this.ui.dateSection);
            self.dateView.render();
            this.trigger("reposition");
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = this.model.details.has("title") && this.model.details.get("workoutCount") > 0;

            data.details = this.model.details.toJSON();
            data.details.weekcount = Math.ceil(data.details.dayCount / 7);
            data.details.totalDuration = 0;
            data.details.totalDistance = 0;

            if (data.details.planApplications && !data.details.planApplications.length)
            {
                data.details.planApplications = null;
            }

            var plannedWorkoutTypeDurations = [];
            _.each(data.details.plannedWorkoutTypeDurations, function(workoutTypeDetails)
            {
                if (workoutTypeDetails.duration || workoutTypeDetails.distance)
                {
                    workoutTypeDetails.duration = Math.ceil(workoutTypeDetails.duration / data.details.weekcount);
                    workoutTypeDetails.distance = Math.ceil(workoutTypeDetails.distance / data.details.weekcount);
                    data.details.totalDuration += workoutTypeDetails.duration;
                    data.details.totalDistance += workoutTypeDetails.distance;

                    plannedWorkoutTypeDurations.push(workoutTypeDetails);
                }
            });
            data.details.plannedWorkoutTypeDurations = plannedWorkoutTypeDurations.length ? plannedWorkoutTypeDurations : null;

            if (data.details.description)
            {
                // strip most tags
                data.details.descriptionText = htmlCleaner.clean(data.details.description);
            }

            return data;
        },

        onApply: function()
        {

            this.applyStartType = Number(this.dateView.ui.applyDateType.val());
            var targetDate = TP.utils.datetime.parse(this.dateView.ui.applyDate.val()).format("YYYY-MM-DD");

            var apply = this.model.applyToDate(targetDate, this.applyStartType);

            var self = this;
            self.waitingOn();
            apply.done(function()
            {
                self.close();
            }).fail(function()
            {
                var errorMessageView = new UserConfirmationView({ template: trainingPlanErrorTemplate });
                errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        confirmDeleteAppliedPlan: function(e)
        {
            var appliedPlanId = this.$(e.target).closest(".appliedPlan").data("appliedplanid");
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate, appliedPlanId: appliedPlanId });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.deleteAppliedPlan, this);
        },

        deleteAppliedPlan: function(options)
        {

            var removeAppliedPlan = new RemoveTrainingPlanCommand({appliedPlanId: options.appliedPlanId});

            var self = this;
            self.waitingOn();
            removeAppliedPlan.execute().done(function()
            {
                self.model.refreshDependencies();
                self.close();
            }).fail(function()
            {
                var errorMessageView = new UserConfirmationView({ template: trainingPlanErrorTemplate });
                errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        moreClicked: function ()
        {
            var $preview = this.$(".preview");

            var toggleOptions =
            {
                effect: "bind",
                direction: "right",
                progress: _.bind(this.trigger, this, "reposition")
            };

            if(!$preview.is(":visible"))
            {
                $preview.height(this.$(".details").height());
                $preview.show(toggleOptions);
                this.$(".planpreview").tp("planpreview", { width: 370 - 30, height: 150 });
                this.$(".more").text("less \u00ab");
            }
            else
            {
                $preview.hide(toggleOptions);
                this.$(".more").text("more \u00bb");
            }
        },

        onDetailsClose: function ()
        {
            this.fullDescriptionView.off("close", this.onDetailsClose, this);
            this.fullDescriptionView = null;
        }

    });

    TomahawkView.wrap(TrainingPlanDetailsView);

    return TrainingPlanDetailsView;
});
