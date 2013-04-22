define(
[
    "underscore",
    "jqueryui/datepicker",
    "jqueryTimepicker",
    "utilities/determineCompletedWorkout",
    "views/quickView/qvMain/qvWorkoutTypeMenuView",
    "views/quickView/qvMain/qvContextMenuView"
],
function (
    _,
    datepicker,
    timepicker,
    determineCompletedWorkout,
    WorkoutTypeMenuView,
    QVContextMenuView
)
{
    var qvHeaderActions =
    {
        headerEvents:
        {
            "click #breakThrough": "onBreakThroughClicked",
            "click #date": "onDateClicked",
            "click .workoutIcon": "onWorkoutIconClicked",
            "click #menuIcon": "onMenuIconClicked"
        },

        headerUi:
        {
            "date": "#date"
        },

        initializeHeaderActions: function()
        {
            _.extend(this.ui, this.headerUi);
            _.extend(this.events, this.headerEvents);
            this.on("close", this.removeUpdateHeaderOnChange, this);
            this.on("render", this.headerOnRender, this);
        },

        headerOnRender: function()
        {
            if (!this.headerInitialized)
            {
                this.model.on("change", this.updateHeaderOnChange, this);
                this.$("#startTimeInput").timepicker({ appendTo: this.$el, 'timeFormat': 'g:i a' });
            }

            this.updateHeaderClass();
        },

        updateHeaderClass: function()
        {
            // first calculate it, then reset if needed
            var tmpElement = $("<div></div>").addClass("grayHeader").addClass("workout");
            tmpElement.addClass(this.getComplianceCssClassName());
            tmpElement.addClass(this.getPastOrCompletedCssClassName());

            var header = this.$(".grayHeader");
            if (header.attr("class") !== tmpElement.attr("class"))
            {
                header.attr("class", tmpElement.attr("class"));
            }
            this.$(".grayHeader").addClass(this.getComplianceCssClassName());
            this.$(".grayHeader").addClass(this.getPastOrCompletedCssClassName());

            this.$(".chzn-select").chosen();

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

        onDateClicked: function(e)
        {
            _.bindAll(this, "onDateChanged");

            var position = [this.ui.date.offset().left, this.ui.date.offset().top + this.ui.date.height()];
            var settings = { dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex };
            var widget = this.ui.date.datepicker("dialog", this.model.getCalendarDay(), this.onDateChanged, settings, position).datepicker("widget");

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1)).css("opacity", 1);
        },

        onDateChanged: function(newDate)
        {
            var newDay = moment(newDate).format(this.model.shortDateFormat);
            this.ui.date.datepicker("hide");
            var oldDay = this.model.getCalendarDay();
            if (newDay !== oldDay)
            {
                var workout = this.model;
                workout.trigger("workout:move", this.model, newDay);
            }
        },

        onWorkoutIconClicked: function()
        {
            var offset = this.$(".workoutIcon").offset();
            var typesMenu = new WorkoutTypeMenuView({ workoutTypeId: this.model.get("workoutTypeValueId") });
            typesMenu.on("selectWorkoutType", this.onSelectWorkoutType, this);
            typesMenu.render().right(offset.left - 5).top(offset.top - 15);
        },

        onSelectWorkoutType: function(workoutTypeId)
        {
            this.model.set("workoutTypeValueId", workoutTypeId);
        },

        onMenuIconClicked: function()
        {
            var offset = this.$("#menuIcon").offset();
            var menu = new QVContextMenuView({ model: this.model });
            menu.on("delete", this.onDeleteWorkout, this);
            menu.on("cut", this.close, this);
            menu.on("copy", this.close, this);
            menu.render().bottom(offset.top).left(offset.left - 20);
        },

        removeUpdateHeaderOnChange: function()
        {
            this.model.off("change", this.updateHeaderOnChange);
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

        updateHeaderOnChange: function()
        {
            this.updateHeaderClass();
        },

        onBreakThroughClicked: function()
        {
            var description = this.model.get("description");

            if (!description)
                description = "";

            if (description.indexOf("BT: ") !== 0)
            {
                this.model.set("description", "BT: " + description);
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakThroughFullOpac.png");
            } else
            {
                this.$("#breakThrough img").attr("src", "assets/images/QVImages/breakthrough.png");
                description = description.replace(/BT: /, "");
                this.model.set("description", description);
            }
        }

    };

    return qvHeaderActions;

});