define(
[
    "underscore",
    "jqueryui/datepicker",
    "jqueryTimepicker",
    "TP",
    "views/quickView/qvMain/qvWorkoutTypeMenuView",
    "views/quickView/qvMain/qvContextMenuView",
    "views/quickView/qvMain/qvOptionsMenuView",
    "views/workout/workoutBarView",
    "views/expando/commentsEditor",
    "utilities/workout/workoutTypes"
],
function (
    _,
    datepicker,
    timepicker,
    TP,
    WorkoutTypeMenuView,
    QVContextMenuView,
    QVOptionsMenuView,
    WorkoutBarView,
    ExpandoCommentsEditorView,
    workoutType
)
{
    var qvHeaderActions =
    {
        headerEvents:
        {
            "click #breakThrough": "onBreakThroughClicked",
            "click #date": "onDateClicked",
            "click .workoutIconLarge": "onWorkoutIconClicked",
            "click #menuIcon": "onMenuIconClicked",
            "focus input.workoutTitle": "onTitleFocus",
            "blur input.workoutTitle": "onTitleBlur",
            "keyup input.workoutTitle": "onTitleChanged",
            "click button#options": "onOptionsClicked",
            "click button#comment": "onCommentsClicked"
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
                var workoutBarView = new WorkoutBarView({ model: this.model });
                workoutBarView.turnOffRenderOnChange();
                workoutBarView.render();

                this.$(".workoutBarView").append(workoutBarView.$el);
                this.$(".workoutTitle").css('width', this.titleWidth());

                this.model.on("change", this.updateHeaderOnChange, this);
                this.$("#startTimeInput").timepicker({ appendTo: this.$el, 'timeFormat': 'g:i a' });
            }
        },

        

        

        onDateClicked: function(e)
        {
            _.bindAll(this, "onDateChanged");

            var position = [this.ui.date.offset().left, this.ui.date.offset().top + this.ui.date.height()];
            var settings = { dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex };
            var widget = this.ui.date.datepicker("dialog", this.model.getCalendarDay(), this.onDateChanged, settings, position).datepicker("widget");

            // hide then show, or else it flashes for some reason
            widget.hide();

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1));
            widget.css("opacity", 1);

            // animate instead of just show directly, or else it flashes for some reason
            widget.show(100);
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
            var icon = this.$(".workoutIconLarge");
            var direction = this.expanded ? "right" : "left";
            var typesMenu = new WorkoutTypeMenuView({ workoutTypeId: this.model.get("workoutTypeValueId"), direction: direction });
            typesMenu.on("selectWorkoutType", this.onSelectWorkoutType, this);

            if (direction === "right")
            {
                typesMenu.setPosition({ fromElement: icon, left: icon.outerWidth() + 10, top: -15 });
            } else
            {
                typesMenu.setPosition({ fromElement: icon, right: -10, top: -15 });
            }

            typesMenu.render();
        },

        onSelectWorkoutType: function(workoutTypeId)
        {
            this.model.set("workoutTypeValueId", workoutTypeId);
        },

        onMenuIconClicked: function()
        {
            var menuIcon = this.$("#menuIcon");
            var menu = new QVContextMenuView({ model: this.model });
            menu.on("delete", this.onDeleteWorkout, this);
            menu.on("cut", this.close, this);
            menu.on("copy", this.close, this);
            menu.setPosition({ fromElement: menuIcon, bottom: 0, top: menuIcon.height(), left: -30 });
            menu.render();
        },

        removeUpdateHeaderOnChange: function()
        {
            this.model.off("change", this.updateHeaderOnChange);
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
        },

        onTitleFocus: function()
        {
            $(document).tooltip("close");
            $(document).tooltip("disable");
        },

        onTitleBlur: function()
        {
            $(document).tooltip("enable");
        },

        onTitleChanged: function ()
        {
            this.$(".workoutTitle").css('width', this.titleWidth());
        },

        titleWidth: function ()
        {
            return (this.$(".workoutTitle").val().length + 1) * 8 + 10 + 'px';
        },
        
        onOptionsClicked: function(e)
        {
            if (this.model.get("workoutTypeValueId") === workoutType.getIdByName("Swim") ||
               !(this.model && this.model.get("detailData") &&
                 this.model.get("detailData").get("flatSamples") &&
                 this.model.get("detailData").get("flatSamples").hasLatLngData))
                return;
            
            var offset = $(e.currentTarget).offset();

            this.optionsMenu = new QVOptionsMenuView({ model: this.model, parentEl: this.$el });
            this.optionsMenu.render().top(offset.top + 18).left(offset.left);
        },
        
        onCommentsClicked: function (e)
        {
            var offset = $(e.currentTarget).offset();


            this.commentsEditorView = new ExpandoCommentsEditorView({ model: this.model, parentEl: this.$el });
            this.commentsEditorView.render().top(offset.top - 13);

            if (this.$el.width() < 1380)
            {
                this.commentsEditorView.setDirection("left");
                this.commentsEditorView.right(offset.left - 12);
            } else
            {
                this.commentsEditorView.setDirection("right");
                this.commentsEditorView.left(offset.left + 87);
            }
        }
    };

    return qvHeaderActions;

});