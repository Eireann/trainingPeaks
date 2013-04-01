define(
[
    "moment",
    "TP",
    "views/quickView/workoutQuickView",
    "views/calendarWorkoutHoverView",
    "views/calendarWorkoutSettings",
    "utilities/workoutTypeName",
    "utilities/determineCompletedWorkout",
    "hbs!templates/views/calendarWorkout",
    "hbs!templates/views/calendarWorkoutDragState"
],
function(moment, TP, WorkoutQuickView, CalendarWorkoutHoverView, CalendarWorkoutSettingsHover, workoutTypeName, determineCompletedWorkout, CalendarWorkoutTemplate, CalendarWorkoutTemplateDragState)
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
            return workoutTypeName(this.model.get("workoutTypeValueId")).replace(/ /g, "");
        },

        getComplianceCssClassName: function ()
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
            } else if (this.model.getCalendarDay() === this.today && determineCompletedWorkout(this.model.attributes))
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

            //this.model.on("view", this.workoutClicked, this);
            //console.log("Watching the model: " + this.model.id);
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

        removeSettingsButton: function (e)
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
                if(e.isDefaultPrevented())
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

        onRender: function()
        {
            // we may not have a workout id yet at first render if it was just added from library
            if (!this.$el.data('workoutId'))
            {
                this.$el.attr(this.attributes());
            }

            // set up drag and drop
            this.makeDraggable();

            // setup dynamic class names
            this.$el.attr("class", this.className());

            // allow to open quick view by triggering click on the model
            //this.model.on("view", this.workoutClicked, this);

        },

        /*
        onClose: function()
        {
            // unbind this since it's not in modelEvents
            this.model.off("view", this.workoutClicked, this);
        },
        */

        makeDraggable: function()
        {
            _.bindAll(this, "draggableHelper", "onDragStart", "onDragStop");
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");
            this.draggableOptions = { appendTo: 'body', helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop };
            this.$el.draggable(this.draggableOptions);
        },

        draggableHelper: function(e)
        {

            var $helperEl = $(CalendarWorkoutTemplateDragState(this.serializeData()));
            var classNames = this.className().split(" ");
            _.each(classNames, function(className)
            {
                $helperEl.addClass(className);
            });
            $helperEl.width(this.$el.width());


            // if they clicked further down on a long workout, set a specific cursor offset for the draggable,
            // else let jqueryui handle it automagically
            var offset = this.$el.offset();
            if ((e.pageY - offset.top) > 50)
            {
                this.$el.data("ui-draggable").options.cursorAt = { top: 45, left: e.pageX - offset.left };
            }

            return $helperEl;
        },

        onDragStart: function()
        {
            this.$el.addClass("dragging");
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        }
    });
});