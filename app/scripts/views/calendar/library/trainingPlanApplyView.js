define(
[
    "underscore",
    "moment",
    "setImmediate",
    "jqueryui/datepicker",
    "TP",
    "utilities/trainingPlan/trainingPlan",
    "shared/utilities/calendarUtility",
    "models/commands/applyTrainingPlan",
    "views/userConfirmationView",
    "hbs!templates/views/calendar/library/applyTrainingPlanErrorView",
    "hbs!templates/views/calendar/library/trainingPlanApply"
],
function(
    _,
    moment,
    setImmediate,
    datepicker,
    TP,
    trainingPlanUtility,
    CalendarUtility,
    ApplyTrainingPlanCommand,
    UserConfirmationView,
    trainingPlanErrorTemplate,
    trainingPlanApplyTemplate
    )
{
    return TP.ItemView.extend(
    {

        applyStartType: TP.utils.trainingPlan.startTypeEnum.StartDate,

        className: "trainingPlanApplyView",
        
        template:
        {
            type: "handlebars",
            template: trainingPlanApplyTemplate
        },

        events:
        {
            "change #applyDateType": "updateDateInputOptions",
            "change #applyDate": "updateDateInput",
            "click .apply": "onApply"
        },

        initialize: function(options)
        {
            this.parentModal = options.parentModal;
            this.defaultDate = options.defaultDate;
            this.user = options.user ? options.user : theMarsApp.user;
            _.bindAll(this, "checkWhetherDayIsSelectable");
        },

        ui: {
            applyDate: "#applyDate",
            applyDateType: "#applyDateType",
            datePicker: ".datepicker",
            dateOptions: ".dateOptions"
        },

        onRender: function()
        {
            this.ui.datePicker.css("position", "relative");

            if(this.parentModal)
            {
                this.ui.datePicker.css("z-index", this.parentModal.$el.css("z-index"));
            }

            this.ui.datePicker.datepicker(
            {
                dateFormat: TP.utils.datetime.formatter.getFormatForDatepicker(),
                firstDay: CalendarUtility.startOfWeek,
                beforeShowDay: this.checkWhetherDayIsSelectable,
                defaultDate: this.defaultDate ? moment(this.defaultDate).toDate() : +0
            });

            this.updateDateInputOptions();
        },

        serializeData: function()
        {
            return {
                details: this.model.details.toJSON(),
                applyDate: this.restrictTargetDate(this.defaultDate || moment())
            };
        },

        updateDateInputOptions: function()
        {
            this.applyStartType = Number(this.ui.applyDateType.val());
            this.updateDateInput();

            this.ui.applyDate.attr("disabled", false);
            this.ui.dateOptions.attr("disabled", false);

            if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                this.ui.applyDate.val(TP.utils.datetime.format(this.model.details.get("eventDate")));
                this.ui.applyDate.attr("disabled", true);
            } 

            if(this.model.details.get("isDynamic") || this.model.details.get("forceDate"))
            {
                this.ui.applyDate.attr("disabled", true);
                this.ui.dateOptions.attr("disabled", true);
            }
        },

        updateDateInput: function()
        {
            var inputDate = moment(this.ui.applyDate.datepicker("getDate"));
            var limitedDate =  this.restrictTargetDate(inputDate);
            this.ui.applyDate.datepicker("setDate", limitedDate.toDate());
        },

        restrictTargetDate: function(targetDate)
        {
            targetDate = moment.local(targetDate); 

            if(this.model.details.get("eventPlan") && this.applyStartType === TP.utils.trainingPlan.startTypeEnum.Event)
            {
                targetDate = moment.local(this.model.details.get("eventDate"));
            }

            if(this.model.details.get("isDynamic"))
            {
                targetDate = moment.local(this.model.details.get("startDate"));

            // force start/end to week start/end
            } else if(this.model.details.get("hasWeeklyGoals"))
            {
                var startDayOfWeek = this.getStartDayOfWeekIndex();
                var endDayOfWeek = this.getEndDayOfWeekIndex(); 

                if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.StartDate && targetDate.day() !== startDayOfWeek) 
                {
                    targetDate = targetDate.day(startDayOfWeek);
                }
                else if (this.applyStartType === TP.utils.trainingPlan.startTypeEnum.EndDate && targetDate.day() !== endDayOfWeek) 
                {
                    targetDate = targetDate.day(endDayOfWeek);
                    if(TP.utils.datetime.isPast(targetDate))
                    {
                        targetDate.add("weeks", 1);
                    }
                }
            }

            return targetDate;
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
        },

        onApply: function()
        {

            this.applyStartType = Number(this.ui.applyDateType.val());
            var targetDate = TP.utils.datetime.parse(this.ui.applyDate.val()).format("YYYY-MM-DD");

            var apply = this.applyToDate(targetDate, this.applyStartType);

            var self = this;
            self.waitingOn();
            apply.fail(function()
            {
                var errorMessageView = new UserConfirmationView({ template: trainingPlanErrorTemplate });
                errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        applyToDate: function(date, startType)
        {
            var command = new ApplyTrainingPlanCommand({
                athleteId: this.user.getCurrentAthleteId(),
                planId: this.model.get('planId'),
                startType: startType,
                targetDate: date
            });
            var deferred = command.execute();
            var self = this;
            deferred.done(function()
            {
                self.trigger("planApplied");
            });
            return deferred;
        }


    });
});
