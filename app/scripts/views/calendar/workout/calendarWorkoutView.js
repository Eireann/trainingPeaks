define(
[
    "underscore",
    "moment",
    "TP",
    "views/calendar/workout/calendarWorkoutDragAndDrop",
    "views/calendar/workout/calendarWorkoutUserCustomization",
    "views/quickView/workoutQuickView",
    "views/calendar/workout/calendarWorkoutHoverView",
    "views/calendar/workout/calendarWorkoutSettings",
    "hbs!templates/views/calendar/workout/calendarWorkout"
],
function(
    _,
    moment,
    TP,
    calendarWorkoutDragAndDrop,
    calendarWorkoutUserCustomization,
    WorkoutQuickView,
    CalendarWorkoutHoverView,
    CalendarWorkoutSettingsView,
    CalendarWorkoutTemplate)
{

    var calendarWorkoutViewBase =
    {

        showThrobbers: false,
        tagName: "div",

        today: moment().format(TP.utils.datetime.shortDateFormat),

        ui: {

        },

        className: function()
        {
            return "workout " +
                this.getDynamicCssClassNames();
        },

        getDynamicCssClassNames: function()
        {
            return this.getWorkoutTypeCssClassName() + " " +
                this.getComplianceCssClassName() + " " +
                this.getPastOrCompletedCssClassName();
        },

        getWorkoutTypeCssClassName: function()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")).replace(/ /g, "");
        },

        getComplianceCssClassName: function()
        {
            var complianceAttributeNames =
            {
                totalTime: "totalTimePlanned"
            };
            /*
                distance: "distancePlanned",
                tssActual: "tssPlanned"
            */
            var workout = this.model;

            for (var key in complianceAttributeNames)
            {

                var plannedValueAttributeName = complianceAttributeNames[key];
                var completedValueAttributeName = key;
                var plannedValue = this.model.get(plannedValueAttributeName) ? this.model.get(plannedValueAttributeName) : 0;
                var completedValue = this.model.get(completedValueAttributeName) ? this.model.get(completedValueAttributeName) : 0;

                if (plannedValue)
                {
                    if ((plannedValue * 0.8) <= completedValue && completedValue <= (plannedValue * 1.2))
                    {
                        return "ComplianceGreen";
                    }
                    else if ((plannedValue * 0.5) <= completedValue && completedValue <= (plannedValue * 1.5))
                    {
                        return "ComplianceYellow";
                    }
                    else
                    {
                        return "ComplianceRed";
                    }
                }
            }


            // if nothing was planned, we can't fail to complete it properly ...

            return "ComplianceNone";
        },

        getPastOrCompletedCssClassName: function()
        {
            if (this.model.getCalendarDay() < this.today)
            {
                return "past";
            } else if (this.model.getCalendarDay() === this.today && TP.utils.workout.determineCompletedWorkout(this.model.attributes))
            {
                return "past";
            } else
            {
                return "future";
            }
        },

        attributes: function()
        {
            return {
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a CalendarWorkoutView without a model";

            this.on("render", this.checkForWorkoutId, this);
            this.on("render", this.setClassName, this);
            this.initializeUserCustomization();
            this.initializeDragAndDrop();

            this.model.on("select", this.setSelected, this);
            this.model.on("unselect", this.setUnSelected, this);
        },

        events:
        {
            "mousedown": "workoutSelected",
            "mouseup": "workoutClicked",
            
            "mouseenter .workoutIcon": "showWorkoutSummaryHover",
            "mouseleave .workoutIcon": "hideWorkoutSummaryHover",

            "click .workoutSettings": "workoutSettingsClicked"

        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        allowSettingsButtonToHide: function(e)
        {
            this.$el.removeClass("menuOpen");
        },

        workoutSettingsClicked: function(e)
        {
            e.preventDefault();

            this.keepSettingsButtonVisible();
            var offset = $(e.currentTarget).offset();
            this.workoutSettings = new CalendarWorkoutSettingsView({ model: this.model });
            this.workoutSettings.render().bottom(offset.top + 10).center(offset.left - 2);
            this.workoutSettings.on("close", this.allowSettingsButtonToHide, this);
            this.workoutSettings.on("mouseleave", this.onMouseLeave, this);
        },

        workoutClicked: function(e)
        {
            if (e)
            {
                if (e.isDefaultPrevented())
                    return;

                e.preventDefault();
            }

            this.allowSettingsButtonToHide();
            this.model.trigger("select", this.model);
            var view = new WorkoutQuickView({ model: this.model });
            view.render();
        },

        setSelected: function()
        {
            this.$el.addClass("selected");
        },

        setUnSelected: function()
        {
            this.$el.removeClass("selected");
        },

        showWorkoutSummaryHover: function()
        {
            if (!this.workoutHoverView || this.workoutHoverView.isClosed)
            {
                var iconOffset = this.$('.workoutIcon').offset();
                this.workoutHoverView = new CalendarWorkoutHoverView({ model: this.model, className: this.getDynamicCssClassNames(), top: iconOffset.top, left: iconOffset.left });
                this.workoutHoverView.render();
                this.workoutHoverView.on("mouseleave", this.hideWorkoutSummaryHover, this);
            }
        },

        hideWorkoutSummaryHover: function(e)
        {
            this.workoutHoverView.close();
            delete this.workoutHoverView;
        },

        checkForWorkoutId: function()
        {
            // we may not have a workout id yet at first render if it was just added from library
            if (!this.$el.data('workoutId'))
            {
                this.$el.attr(this.attributes());
            }

        },

        setClassName: function()
        {
            // setup dynamic class names - in case they changed since initial render
            this.$el.attr("class", this.className());
            if (this.model.selected)
            {
                this.setSelected();
            }
        },

        workoutSelected: function()
        {
            this.model.trigger("select", this.model);
        }

    };

    _.extend(calendarWorkoutViewBase, calendarWorkoutDragAndDrop);
    _.extend(calendarWorkoutViewBase, calendarWorkoutUserCustomization);
    return TP.ItemView.extend(calendarWorkoutViewBase);
});