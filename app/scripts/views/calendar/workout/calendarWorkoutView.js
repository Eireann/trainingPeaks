define(
[
    "underscore",
    "moment",
    "TP",
    "views/calendar/workout/calendarWorkoutDragAndDrop",
    "views/calendar/workout/calendarWorkoutUserCustomization",
    "views/quickView/workoutQuickView",
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
    CalendarWorkoutSettingsView,
    CalendarWorkoutTemplate)
{

    var calendarWorkoutViewBase =
    {

        showThrobbers: false,
        tagName: "div",

        today: moment().format(TP.utils.datetime.shortDateFormat),

        className: function()
        {
            return "workout " + this.getDynamicCssClassNames();
        },

        ui:
        {
            
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
            "click": "workoutTouched",
            "mouseup .workoutSettings": "workoutSettingsClicked",
            "click .workoutSettings": "workoutSettingsTouched"
        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        allowSettingsButtonToHide: function(e)
        {
            this.$el.removeClass("menuOpen");
        },

        workoutSettingsTouched: function(e)
        {
            if(theMarsApp.isTouchEnabled())
            {
                e.preventDefault();
            }
        },

        workoutSettingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "workoutSettingsClicked", "eventLabel": "" });

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
            if (this.$el.hasClass("dragging"))
            {
                e.preventDefault();
                return;
            }

            if (e)
            {
                if (e.button && e.button === 2)
                    return;

                if (e.isDefaultPrevented())
                    return;

                e.preventDefault();
            }

            this.allowSettingsButtonToHide();
            this.model.trigger("select", this.model);
            var view = new WorkoutQuickView({ model: this.model });
            view.render();

            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "quickViewOpened", "eventLabel": "" });
        },

        workoutTouched: function(e)
        {
            if(e.isDefaultPrevented())
            {
                return;
            }

            if(theMarsApp.isTouchEnabled())
            {
                e.preventDefault();
            }
        },

        setSelected: function()
        {
            this.$el.addClass("selected");
        },

        setUnSelected: function()
        {
            this.$el.removeClass("selected");
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
        },

        waitingOn: function()
        {
            this.$(".workoutDiv").addClass("waiting");
        },

        waitingOff: function()
        {
            this.$(".workoutDiv").removeClass("waiting");
        }

    };

    _.extend(calendarWorkoutViewBase, calendarWorkoutDragAndDrop);
    _.extend(calendarWorkoutViewBase, calendarWorkoutUserCustomization);
    return TP.ItemView.extend(calendarWorkoutViewBase);
});