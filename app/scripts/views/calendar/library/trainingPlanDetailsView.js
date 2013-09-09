define(
[
    "underscore",
    "jqueryHtmlClean",
    "setImmediate",
    "TP",
    "models/commands/applyTrainingPlan",
    "models/commands/removeTrainingPlan",
    "views/userConfirmationView",
    "./trainingPlanFullDescriptionView",
    "scripts/helpers/multilineEllipsis",
    "views/calendar/library/trainingPlanDatePickerView",
    "hbs!templates/views/confirmationViews/unapplyConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(
    _,
    jqueryHtmlClean,
    setImmediate,
    TP,
    ApplyTrainingPlanCommand,
    RemoveTrainingPlanCommand,
    UserConfirmationView,
    trainingPlanFullDescriptionView,
    multilineEllipsis,
    TrainingPlanDatePickerView,
    deleteConfirmationTemplate,
    trainingPlanErrorTemplate,
    trainingPlanDetailsViewTemplate
    )
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlanDetails",
        modal: true,
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

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }

            this.dateView.setElement(this.ui.dateSection);
            self.dateView.render(); 
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = this.model.details.has("title");

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
                var cleanText = $.htmlClean(data.details.description, { allowedTags: ["p", "br", "li", "ul", "ol"] });

                // wrap plain text in paragraphs, at the top level only
                var htmlContainer = $("<div>").html(cleanText);
                htmlContainer.contents().filter(function(){return this.nodeType === 3;}).wrap("<p></p>");

                // remove line break tags, at the top level only
                htmlContainer.contents().filter("br").remove(); 

                data.details.descriptionText = htmlContainer.html();
            }

            return data;
        },

        onApply: function()
        {

            this.applyStartType = Number(this.dateView.ui.applyDateType.val());
            var targetDate = this.dateView.ui.applyDate.val();

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

        alignArrowTo: function($element)
        {
            // align the top and left of this popup to the target library item
            this.alignedTo = $element;
            this.left($element.offset().left + $element.width() + 16);
            var targetTop = $element.offset().top;
            this.top(targetTop);

            // offset the arrow to line up with middle of target element
            var arrowOffset = Math.round($element.height() / 2) + 8;
            var arrowTop = arrowOffset;
            
            // if we're too close to the bottom, move the window up 
            var windowHeight = $(window).height();
            if ((this.$el.offset().top + this.$el.height()) >= (windowHeight - 30))
            {
                this.top(windowHeight - this.$el.height() - 30);
                var myTop = this.$el.offset().top;
                arrowTop = Math.round((targetTop - myTop) + arrowOffset);
            }

            if(arrowTop > this.$el.height() - 10)
            {
                arrowTop = this.$el.height() - 10;
            }
                
            this.$(".arrow").css("top", arrowTop + "px");
        },

        moreClicked: function ()
        {
            if (this.fullDescriptionView)
            {
                return;
            }
            this.fullDescriptionView = new trainingPlanFullDescriptionView({ model: this.model });
            this.fullDescriptionView.on("close", this.onDetailsClose, this);
            this.fullDescriptionView.render().left(this.$el.offset().left + this.$el.width() + 10);
        },

        onDetailsClose: function ()
        {
            this.fullDescriptionView.off("close", this.onDetailsClose, this);
            this.fullDescriptionView = null;
        }

    });
});