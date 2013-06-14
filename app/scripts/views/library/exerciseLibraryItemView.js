define(
[
    "TP",
    "jqueryui/draggable",
    "hbs!templates/views/library/exerciseLibraryItemView",
    "hbs!templates/views/library/exerciseLibraryItemViewDragState"
],
function(TP, draggable, ExerciseLibraryItemViewTemplate, ExerciseLibraryItemViewTemplateDragState)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "libraryExercise workout",

        attributes: function()
        {
            return {
                "data-ExerciseId": this.model.id
            };
        },

        events:
        {
            mousedown: "onMouseDown"
        },

        template:
        {
            type: "handlebars",
            template: ExerciseLibraryItemViewTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a LibraryExerciseItemView without a model";


            _.bindAll(this, "draggableHelper", "onDragStart", "onDragStop");

            this.getIconType();

            this.model.on("select", this.onItemSelect, this);
            this.model.on("unselect", this.onItemUnSelect, this);
        },

        onRender: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            this.$el.data("LibraryId", this.model.get("exerciseLibraryId"));
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "addExerciseFromLibrary");
            this.$el.draggable({ appendTo: theMarsApp.getBodyElement(), 'z-index': 100, helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop, containment: "#calendarWrapper" });
        },

        draggableHelper: function()
        {
            var $helperEl = $(ExerciseLibraryItemViewTemplateDragState(this.serializeData()));
            $helperEl.addClass(this.className);
            $helperEl.addClass(this.getWorkoutTypeCssClassName());
            $helperEl.addClass("future");
            $helperEl.width(this.$el.width());
            return $helperEl;
        },

        onDragStart: function()
        {
            this.$el.addClass("dragging");
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        },

        getIconType: function ()
        {
            this.$el.addClass(this.getWorkoutTypeCssClassName());
            // we need the "future" class to get the right icon.
            this.$el.addClass("future");
        },

        getWorkoutTypeCssClassName: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeId")).replace(/ /g, "");
        },

        onMouseDown: function()
        {
            this.model.trigger("select", this.model);
        },

        onItemSelect: function()
        {
            this.$el.addClass("selected");
        },

        onItemUnSelect: function()
        {
            this.$el.removeClass("selected");
        }

    });
});