define(
[
    "TP",
    "jqueryui/draggable",
    "hbs!templates/views/library/libraryWorkoutItem"
],
function(TP, draggable, LibraryWorkoutItemTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "workout",

        attributes: function()
        {
            if (!this.model)
            {
                return {};
            }

            return {
                "data-WorkoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: LibraryWorkoutItemTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a LibraryWorkoutItemView without a model";
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