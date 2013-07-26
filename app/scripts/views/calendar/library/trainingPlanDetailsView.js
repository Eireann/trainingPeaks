define(
[
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "TP",
    "models/commands/applyTrainingPlan",
    "models/library/appliedPlan",
    "views/userConfirmationView",
    "utilities/trainingPlan/trainingPlan",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(
    datepicker,
    jquerySelectBox,
    setImmediate,
    TP,
    ApplyTrainingPlanCommand,
    AppliedPlan,
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
        dateFormat: "MM/DD/YYYY",

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
            //"change .alterAppliedPlan" : "onAppliedPlanOptionChange"
        },

        initialize: function()
        {
            this.model.details.on("change", this.render, this);
            this.once("render", this.onInitialRender, this);
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
                self.$(".datepicker").datepicker({ dateFormat: "mm/dd/yy", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
                self.$("select").selectBoxIt({ dynamicPositioning: false });
            });

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = data.planStatus === TP.utils.trainingPlan.getStatusByName("Purchased") || data.planStatus === TP.utils.trainingPlan.getStatusByName("Applied") ? true : false;
            data.applied = data.planStatus === TP.utils.trainingPlan.getStatusByName("Applied") ? true : false;
            data.applyDate = moment().day(1).format(this.dateFormat);
            data.details = this.model.details.toJSON();

            if (data.details.planApplications && !data.details.planApplications.length)
            {
                data.details.planApplications = null;
            }
            else
            {
                _.each(data.details.planApplications, function(planApplication, index) {
                    planApplication.eventPlan = data.details.eventPlan;
                }, this);
            }


            return data;
        },

        onApply: function()
        {

            var startType = Number(this.$("#applyDateType").val());

            var targetDate = this.$("#applyDate").val();

            if(this.model.details.get("eventPlan") && startType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                targetDate = this.model.details.get("eventDate");
            }
            else if (startType === TP.utils.trainingPlan.startTypeEnum.StartDate) 
            {
                targetDate = moment(targetDate).day(1).format(this.dateFormat);
            }
            else if (startType === TP.utils.trainingPlan.startTypeEnum.EndDate) 
            {
                targetDate = moment(targetDate).day(7).format(this.dateFormat);
            }

            var command = new ApplyTrainingPlanCommand({
                planId: this.model.get("planId"),
                startType: startType,
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
            var appliedPlan = new AppliedPlan({appliedPlanId: options.appliedPlanId});

            var self = this;
            self.waitingOn();
            appliedPlan.destroy().done(function()
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
            this.alignedTo = $element;
            this.left($element.offset().left + $element.width() + 15);
            var targetTop = $element.offset().top;
            this.top(targetTop);

            var windowHeight = $(window).height();
            if ((this.$el.offset().top + this.$el.height()) >= (windowHeight - 30))
            {
                this.top(windowHeight - this.$el.height() - 30);
                var myTop = this.$el.offset().top;
                var arrowTop = Math.round((targetTop - myTop) + 40);
                this.$(".arrow").css("top", arrowTop + "px");
            }
        },

        onApplyDateTypeChange: function()
        {
            var startType = Number(this.$("#applyDateType").val());
            if (startType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                this.$("#applyDate").hide();
            } else if(startType === TP.utils.trainingPlan.startTypeEnum.EndDate)
            {
                // end on last day of this week
                this.$("#applyDate").val(moment().day(7).format(this.dateFormat)).show();
            } else if(startType === TP.utils.trainingPlan.startTypeEnum.StartDate)
            {
                // start on first day of this week
                this.$("#applyDate").val(moment().day(1).format(this.dateFormat)).show();
            }
        }

        /*
        onAppliedPlanOptionChange: function(e)
        {
            var selection = $(e.target).val();
            if (selection === "move")
            {
                this.$(e.target).closest(".appliedPlan").find(".startEndPlan").removeClass("optionsDisabled");
            }   
            else
            {
                this.$(e.target).closest(".appliedPlan").find(".startEndPlan").addClass("optionsDisabled");
            } 

            if (selection === "unapply")
                this.deleteAppliedPlan(e);
        },

        moveAppliedPlan: function(e)
        {
            var appliedPlanId = this.$(e.target).closest(".appliedPlan").data("appliedplanid");
            var startType = trainingPlanUtility.startTypeEnum["StartDate"];
            var targetDate;


        },
        */


    });
});