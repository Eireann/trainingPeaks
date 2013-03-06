define(
[
    "moment",
    "TP",
    "views/workoutQuickView",
    "views/calendarWorkoutHoverView",
    "views/calendarWorkoutSettings",
    "utilities/workoutTypeName",
    "hbs!templates/views/calendarWorkout"
],
function(moment, TP, WorkoutQuickView, CalendarWorkoutHoverView, CalendarWorkoutSettingsHover, workoutTypeName, determineCompletedWorkout, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",

        today: moment().format("YYYY-MM-DD"),

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
            return workoutTypeName(this.model.get("workoutTypeValueId"));
        },

        getComplianceCssClassName: function ()
        {

            var complianceAttributeNames = {
                distance: "distancePlanned",
                totalTime: "totalTimePlanned",
                tssActual: "tssPlanned"
            };

            var workout = this.model;

            for (var key in complianceAttributeNames)
            {
                var plannedValueAttributeName = complianceAttributeNames[key];
                var completedValueAttributeName = key;
                var plannedValue = this.model.get(plannedValueAttributeName) ? this.model.get(plannedValueAttributeName) : 0;
                var completedValue = this.model.get(completedValueAttributeName) ? this.model.get(completedValueAttributeName) : 0;

                if (plannedValue)
                {
            if ((totalTimePlanned * 0.8) <= totalTime && totalTime <= (totalTimePlanned * 1.2))
            {
                return "ComplianceGreen";
            }
            else if ((totalTimePlanned * 0.5) <= totalTime && totalTime <= (totalTimePlanned * 1.5))
            {
                return "ComplianceYellow";
            }
            else
            {
                return "ComplianceRed";
            }
        },

        getPastOrCompletedCssClassName: function()
        {
            if (this.model.get("totalTime"))
            {
                return "past";
            } else if (this.model.getCalendarDay() < this.today)
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
        },

        events: {
            mouseup: "workoutClicked",

            mouseenter: "onMouseEnter",
            mouseleave: "onMouseLeave",

            "mouseenter .workoutIcon": "showWorkoutSummaryHover",
            "mouseleave .workoutIcon": "hideWorkoutSummaryHover",

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
            this.hideWorkoutSummaryHover(e);
        },

        showSettingsButton: function()
        {
            this.$(".workoutSettings").css('display', "block");
        },

        removeSettingsButton: function (e)
        {
            var toElement = $(document.elementFromPoint(e.pageX, e.pageY));
            if (!toElement.is(".workoutSettings") && !toElement.is("#workoutSettingsDiv") && !toElement.is(".hoverBox"))
            {
                this.$(".workoutSettings").css('display', "none");
            }
        },

        workoutSettingsClicked: function (e)
        {
            e.preventDefault();

            var offset = $(e.currentTarget).offset();
            this.workoutSettings = new CalendarWorkoutSettingsHover({ model: this.model, top: offset.top + 10, left: offset.left + 5 });
            this.workoutSettings.render();
            this.workoutSettings.on("mouseleave", this.onMouseLeave, this);
        },

        workoutClicked: function (e) 
        {
            if (e.isDefaultPrevented())
                return;

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

        onRender: function()
        {
            if (!this.$el.data('workoutId'))
            {
                this.$el.attr(this.attributes());
            }

            this.makeDraggable();

            this.$el.attr("class", this.className());
        },

        makeDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");
            this.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
        }
    });
});