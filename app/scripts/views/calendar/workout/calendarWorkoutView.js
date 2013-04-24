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
    CalendarWorkoutSettingsHover,
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

            return "ComplianceGreen";
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

        },

        events:
        {
            "click": "workoutClicked",

            "mouseenter": "onMouseEnter",
            "mouseleave": "onMouseLeave",

            "mouseenter .workoutIcon": "showWorkoutSummaryHover",
            "mouseleave .workoutIcon": "hideWorkoutSummaryHover",

            "click .workoutSettings": "workoutSettingsClicked"

        },

        onMouseEnter: function(e)
        {
            this.showSettingsButton(e);
            //this.showWorkoutSummaryHover(e);
        },

        onMouseLeave: function(e)
        {
            var toElement = document.elementFromPoint(e.pageX, e.pageY);
            if (e.toElement === this.el)
            {
                return;
            }

            this.removeSettingsButton(e);
            //this.hideWorkoutSummaryHover(e);
        },

        showSettingsButton: function()
        {
            this.$(".workoutSettings").css('display', "block");
        },

        removeSettingsButton: function(e)
        {
            var toElement = $(document.elementFromPoint(e.pageX, e.pageY));
            if (!toElement.is(".workoutSettings") && !toElement.is("#workoutSettingsDiv") && !toElement.is(".hoverBox") && !toElement.is(".modal") && !toElement.is(".modalOverlay"))
            {
                this.$(".workoutSettings").css('display', "none");
            }
        },

        workoutSettingsClicked: function(e)
        {
            e.preventDefault();

            var offset = $(e.currentTarget).offset();
            this.workoutSettings = new CalendarWorkoutSettingsHover({ model: this.model });
            this.workoutSettings.render().bottom(offset.top + 10).center(offset.left + 5);

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

            var view = new WorkoutQuickView({ model: this.model });
            view.render();
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
        }

    };

    _.extend(calendarWorkoutViewBase, calendarWorkoutDragAndDrop);
    _.extend(calendarWorkoutViewBase, calendarWorkoutUserCustomization);
    return TP.ItemView.extend(calendarWorkoutViewBase);
});