define(
[
    "TP",
    "jqueryui/draggable",
    "hbs!templates/views/library/exerciseLibraryItemView"
],
function(TP, draggable, ExerciseLibraryItemViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "exercise",

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
            this.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
        }

    });
});