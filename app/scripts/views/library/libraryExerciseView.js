define(
[
    "TP",
    "jqueryui/draggable",
    "hbs!templates/views/library/libraryExerciseView"
],
function(TP, draggable, LibraryExerciseViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "exercise",

        attributes: function()
        {
            if (!this.model)
            {
                return {};
            }

            return {
                "data-ExerciseId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: LibraryExerciseViewTemplate
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