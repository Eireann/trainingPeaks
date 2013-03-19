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
        },

        onRender: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            _.bindAll(this, "draggableHelper");
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "addExerciseFromLibrary");
            this.$el.draggable({ appendTo: 'body', 'z-index': 100, cursorAt: { top: 15, left: 25 }, helper: this.draggableHelper });
            
        },

        draggableHelper: function()
        {
            console.log(this.model.attributes);
            var $helperEl = $(ExerciseLibraryItemViewTemplateDragState(this.serializeData()));
            $helperEl.addClass(this.className);
            return $helperEl;
        }

    });
});