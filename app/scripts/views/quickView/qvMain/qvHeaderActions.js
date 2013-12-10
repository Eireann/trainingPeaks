define(
[
    "jquery",
    "underscore",
    "moment",
    "jqueryui/datepicker",
    "jqueryTimepicker",
    "TP",
    "framework/notYetImplemented",
    "views/quickView/qvMain/qvWorkoutTypeMenuView",
    "views/quickView/qvMain/qvContextMenuView",
    "views/quickView/qvMain/qvOptionsMenuView",
    "views/workout/workoutBarView",
    "views/expando/commentsEditor",
    "views/userMessageView",
    "shared/utilities/calendarUtility",
    "utilities/workout/workoutTypes",
    "expando/views/addExpandoPodView",
    "hbs!templates/views/userMessage/saveWorkoutBeforeAttachment"
],
function (
    $,
    _,
    moment,
    datepicker,
    timepicker,
    TP,
    notYetImplemented,
    WorkoutTypeMenuView,
    QVContextMenuView,
    QVOptionsMenuView,
    WorkoutBarView,
    ExpandoCommentsEditorView,
    UserMessageView,
    CalendarUtility,
    workoutType,
    AddExpandoPodView,
    saveWorkoutBeforeAttachmentTemplate
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
            "click button#comment": "onCommentsClicked",
            "click .expandedViewsButtons .view": notYetImplemented,
            "click .charts .addChart": "_onAddChartClicked",
            "click .charts .setLayout": notYetImplemented
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
                workoutBarView.on("before:displayAttachmentView", this.checkIfCanAddAttachments, this);
                workoutBarView.render();

                this.$(".workoutBarView").append(workoutBarView.$el);
                this.$(".workoutTitle").css("width", this.titleWidth());

                if (!(this.isNewWorkout && !this.model.get("workoutId")))
                    this.initializeTimePicker();
            }
        },

        initializeTimePicker: function()
        {
            this.$("#startTimeInput").timepicker({ appendTo: this.$el, timeFormat: "g:i a", step: 15 });
        },

        onDateClicked: function(e)
        {
            if (this.isNewWorkout && !this.model.get("workoutId"))
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "headerDateClicked", "eventLabel": "" });

            _.bindAll(this, "onDateChanged");

            var position = [this.ui.date.offset().left, this.ui.date.offset().top + this.ui.date.height()];
            var settings = { dateFormat: "yy-mm-dd", firstDay: CalendarUtility.startOfWeek };
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

            var self = this;

            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "workoutDateChanged", "eventLabel": "" });
            var newDay = moment(newDate).format(this.model.shortDateFormat);
            this.ui.date.datepicker("hide");
            var workout = this.model;
            var oldDay = workout.getCalendarDay();
            if (newDay !== oldDay)
            {
                var moveWorkout = function()
                {
                    // prepare our target day collection
                    // theMarsApp.controllers.calendarController.views.calendar.scrollToDate(newDate);
                    workout.moveToDay(newDay);
                };

                theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                    moveWorkout, 
                    {targetDate: newDay}
                );

            }
        },

        onWorkoutIconClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "headerWorkoutIconClicked", "eventLabel": "" });

            var icon = this.$(".workoutIconLarge");
            var direction = this.expanded ? "right" : "left";
            var typesMenu = new WorkoutTypeMenuView({ workoutTypeId: this.model.get("workoutTypeValueId"), direction: direction });
            typesMenu.on("selectWorkoutType", this.onSelectWorkoutType, this);

            if (direction === "right")
                typesMenu.setPosition({ fromElement: icon, left: icon.outerWidth() + 10, top: -13 });
            else
                typesMenu.setPosition({ fromElement: icon, right: -12, top: -13 });

            typesMenu.render();
        },

        onSelectWorkoutType: function(workoutTypeId)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "workoutTypeChanged", "eventLabel": "" });
            this.model.set("workoutTypeValueId", workoutTypeId);
        },

        onMenuIconClicked: function()
        {
            if (this.isNewWorkout && !this.model.get("workoutId"))
                return;
            
            var menuIcon = this.$("#menuIcon");
            var menu = new QVContextMenuView({ model: this.model });
            menu.on("delete", this.onDeleteWorkout, this);
            menu.on("cut", this.close, this);
            menu.on("copy", this.close, this);
            menu.on("print", this.print, this);
            menu.setPosition({ fromElement: menuIcon, bottom: 7, left: -32, top: 6 });
            menu.render();
        },

        onBreakThroughClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "workoutBreakThroughChanged", "eventLabel": "" });

            var description = this.model.get("description");

            if (!description)
                description = "";

            if (description.indexOf("BT:") !== 0)
                this.model.set("description", "BT: " + description);
            else
            {
                description = description.replace(/BT:/, "").trim();
                this.model.set("description", description);
            }

            this.model.autosave();
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
            
            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "headerCommentsClicked", "eventLabel": "" });

            var offset = $(e.currentTarget).offset(),
                maxHeight = (this.expandoController.layout.$el.parent().height() / 2) + 64;

            this.commentsEditorView = new ExpandoCommentsEditorView({ model: this.model, parentEl: this.$el, maxHeight: maxHeight});
            this.commentsEditorView.render().top(offset.top - 12);

            if (this.$el.width() < 1380)
            {
                this.commentsEditorView.setDirection("left");
                this.commentsEditorView.right(offset.left - 14);
            }
            else
            {
                this.commentsEditorView.setDirection("right");
                this.commentsEditorView.left(offset.left + 89);
            }
        },

        checkIfCanAddAttachments: function(displayAttachmentsViewDeferred)
        {
            if (this.isNewWorkout && !this.model.get("workoutId"))
            {
                var view = new UserMessageView({ template: saveWorkoutBeforeAttachmentTemplate });
                view.render();
                displayAttachmentsViewDeferred.reject();
            }
        },

        print: function()
        {
            this.$("textarea").each(function()
            {
                var $self = $(this);
                $self.text($self.val());
            });
            window.print();
        },

        _onAddChartClicked: function(event)
        {

            var view = new AddExpandoPodView.Tomahawk({
                offset: "right",
                target: $(event.target)
            }).render();
        }

    };

    return qvHeaderActions;

});
