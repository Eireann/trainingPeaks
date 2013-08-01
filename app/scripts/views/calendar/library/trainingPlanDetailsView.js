define(
[
    "underscore",
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "TP",
    "models/commands/applyTrainingPlan",
    "models/commands/removeTrainingPlan",
    "views/userConfirmationView",
    "utilities/trainingPlan/trainingPlan",
    "hbs!templates/views/confirmationViews/unapplyConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(
    _,
    datepicker,
    jquerySelectBox,
    setImmediate,
    TP,
    ApplyTrainingPlanCommand,
    RemoveTrainingPlanCommand,
    UserConfirmationView,
    trainingPlanUtility,
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
            "change #applyDateType": "onApplyDateTypeChange",
            "click #closeIcon": "close",
            "click .removePlan": "confirmDeleteAppliedPlan"
        },

        initialize: function()
        {
            this.model.details.on("change", this.render, this);
            this.once("render", this.onInitialRender, this);
            _.bindAll(this, "checkWhetherDayIsSelectable");
        },

        ui: {
            applyDate: "#applyDate",
            applyDateType: "#applyDateType" 
        },

        onInitialRender: function()
        {
            this.waitingOn();
            var self = this;
            this.model.details.fetch().done(function() { self.waitingOff(); });
        },

        onClose: function()
        {
            this.model.details.off("change", this.render, this);
        },

        onRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "m/d/yy", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex,
                    beforeShowDay: self.checkWhetherDayIsSelectable });
                self.$("select").selectBoxIt({ dynamicPositioning: false });
            });

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }

            this.updateDateInput();
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = this.model.details.has("title") && _.contains([null, 
                TP.utils.trainingPlan.getStatusByName("Purchased"),
                TP.utils.trainingPlan.getStatusByName("Applied")], 
                data.planStatus);

            data.applyDate = moment().format(this.dateFormat);
            data.details = this.model.details.toJSON();
            data.details.weekcount = Math.ceil(data.details.dayCount / 7);

            if (data.details.planApplications && !data.details.planApplications.length)
            {
                data.details.planApplications = null;
            }

            var plannedWorkoutTypeDurations = [];
            _.each(data.details.plannedWorkoutTypeDurations, function(workoutTypeDetails)
            {
                if(workoutTypeDetails.duration || workoutTypeDetails.distance)
                {
                    plannedWorkoutTypeDurations.push(workoutTypeDetails);
                }
            });
            data.details.plannedWorkoutTypeDurations = plannedWorkoutTypeDurations.length ? plannedWorkoutTypeDurations : null;

            return data;
        },

        onApply: function()
        {

            this.applyStartType = Number(this.ui.applyDateType.val());

            var targetDate = this.restrictTargetDate(this.ui.applyDate.val());

            var command = new ApplyTrainingPlanCommand({
                athleteId: theMarsApp.user.getCurrentAthleteId(),
                planId: this.model.get("planId"),
                startType: this.applyStartType,
                targetDate: targetDate
            });

            var self = this;
            self.waitingOn();
            command.execute().done(function()
            {
                self.refreshPlanAndCalendar(command.get("appliedPlan.startDate")); 
            }).fail(function()
            {
                var errorMessageView = new UserConfirmationView({ template: trainingPlanErrorTemplate });
                errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        refreshPlanAndCalendar: function(calendarDate)
        {
            this.model.fetch();
            this.close();
            this.model.trigger("requestRefresh", calendarDate);
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
                self.refreshPlanAndCalendar(); 
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
            this.left($element.offset().left + $element.width() + 15);
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

        onApplyDateTypeChange: function()
        {
            this.applyStartType = Number(this.ui.applyDateType.val());
            this.updateDateInput();
            if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                this.ui.applyDate.hide();
            } 
            else
            {
                this.ui.applyDate.show();
            }
        },

        updateDateInput: function()
        {
            this.ui.applyDate.val(this.restrictTargetDate(this.ui.applyDate.val()));
        },

        restrictTargetDate: function(targetDate)
        {
            targetDate = moment(targetDate); 

            if(this.model.details.get("eventPlan") && this.applyStartType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                targetDate = moment(this.model.details.get("eventDate"));
            }

            // force start/end to week start/end
            if(this.model.details.get("hasWeeklyGoals"))
            {

                var startDayOfWeek = this.getStartDayOfWeekIndex();
                var endDayOfWeek = this.getEndDayOfWeekIndex(); 

                if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.StartDate && moment(targetDate).day() !== startDayOfWeek) 
                {
                    targetDate = moment(targetDate).day(startDayOfWeek);
                }
                else if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.EndDate && moment(targetDate).day() !== endDayOfWeek) 
                {
                    targetDate = moment(targetDate).day(endDayOfWeek);
                    if(targetDate.format("YYYY-MM-DD") < moment().format("YYYY-MM-DD"))
                    {
                        targetDate.add("weeks", 1);
                    }
                }
            }

            return targetDate.format(this.dateFormat);
        },

        checkWhetherDayIsSelectable: function(date)
        {
            var day = date.getDay();

            var selectable = this.canSelectDay(day);
            var className = "";
            return [selectable, className];
        },

        canSelectDay: function(day)
        {

            if(this.model.details.get("hasWeeklyGoals"))
            {
                if(this.applyStartType === TP.utils.trainingPlan.startTypeEnum.EndDate && day !== this.getEndDayOfWeekIndex())
                {
                    return false;
                }
                else if(this.applyStartType === TP.utils.trainingPlan.startTypeEnum.StartDate && day !== this.getStartDayOfWeekIndex())
                {
                    return false;
                }
            }

            return true;
        },

        getStartDayOfWeekIndex: function()
        {
            return this.model.details.has("startDate") ? moment(this.model.details.get("startDate")).day() : 1;
        },

        getEndDayOfWeekIndex: function()
        {
            return this.model.details.has("endDate") ? moment(this.model.details.get("endDate")).day() : 0;
        }

    });
});