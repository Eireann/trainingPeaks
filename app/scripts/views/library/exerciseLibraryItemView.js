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
        className: "libraryExercise",

        attributes: function()
        {
            return {
                "data-ExerciseId": this.model.id
            };
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
        },

        onRender: function()
        {
            this.makeDraggable();
            this.getIconType();
        },

        makeDraggable: function()
        {
            this.$el.data("LibraryId", this.model.get("exerciseLibraryId"));
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "addExerciseFromLibrary");
            this.$el.draggable({ appendTo: theMarsApp.getBodyElement(), 'z-index': 100, helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop, containment: "#calendarContainer" });
        },

        draggableHelper: function()
        {
            var $helperEl = $(ExerciseLibraryItemViewTemplateDragState(this.serializeData()));
            $helperEl.addClass(this.className);
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
            this.$el.addClass("future")
        },

        getWorkoutTypeCssClassName: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeId")).replace(/ /g, "");
        },

    });
});