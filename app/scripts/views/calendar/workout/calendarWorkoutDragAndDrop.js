define(
[
    "TP",
    "hbs!templates/views/calendar/workout/calendarWorkoutDragState"
],
function(TP, CalendarWorkoutTemplateDragState)
{
    var calendarWorkoutDragAndDrop = {

        initializeDragAndDrop: function()
        {
            this.on("render", this.onRenderDragAndDrop, this);
        },

        onRenderDragAndDrop: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            _.bindAll(this, "draggableHelper", "onDragStart", "onDragStop");
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");
            this.draggableOptions = { appendTo: theMarsApp.getBodyElement(), helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop, containment: "#calendarContainer" };
            this.$el.draggable(this.draggableOptions);
        },

        makeDraggableHelperElement: function()
        {
            var $helperEl = $(CalendarWorkoutTemplateDragState(this.serializeData()));
            var classNames = this.className().split(" ");
            _.each(classNames, function(className)
            {
                $helperEl.addClass(className);
            });
            $helperEl.width(this.$el.width());
            return $helperEl;
        },

        draggableHelper: function(e)
        {
            var $helperEl = this.makeDraggableHelperElement();

            // if they clicked further down on a long workout, set a specific cursor offset for the draggable,
            // else let jqueryui handle it automagically
            var offset = this.$el.offset();
            if ((e.pageY - offset.top) > 50)
            {
                this.$el.data("ui-draggable").options.cursorAt = { top: 30, left: e.pageX - offset.left };
            }
            return $helperEl;
        },

        onDragStart: function()
        {
            this.$el.addClass("dragging");

            TP.analytics("send", "event", "calendar", "dragdrop", "workout");
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        }
    };

    return calendarWorkoutDragAndDrop;
});