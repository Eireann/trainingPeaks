define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!templates/views/calendar/workout/calendarWorkoutDragState"
],
function($, _, TP, CalendarWorkoutTemplateDragState)
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
            if(this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.EditLockedWorkout, { workout :this.model }))
            {
                _.bindAll(this, "onDragStart", "onDragStop");
                this.draggableOptions =
                {
                    appendTo: theMarsApp.getBodyElement(),
                    helper: _.bind(this._makeHelper, this),
                    start: this.onDragStart,
                    stop: this.onDragStop,
                    addClasses: false
                };
                this.$el.draggable(this.draggableOptions).data({ handler: this.model });
            }
        },

        _makeHelper: function()
        {
            var $helper = $("<div class='dragHelper'/>");
            $helper.append(this.$el.clone().width(this.$el.width()));
            return $helper;
        },


        onDragStart: function(e, ui)
        {
            var $helper = $(ui.helper);
            $helper.addClass('dragHelper');
            $helper.width(this.$el.width());

            this.$el.addClass("dragging");
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "dragDropStart", "eventLabel": "workout" });
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        }
    };

    return calendarWorkoutDragAndDrop;
});
