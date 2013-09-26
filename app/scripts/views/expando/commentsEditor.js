define(
[
    "TP",
    "views/workoutCommentsEditor/workoutCommentsEditor",
    "hbs!templates/views/expando/commentsEditor"
],
function(TP, WorkoutCommentsEditorView, commentsEditorTemplate)
{
    return TP.ItemView.extend(
    {
        modal: true,
        showThrobbers: true,
        tagName: "div",

        className: "expandoCommentsEditor",

        events:
        {
            "click div#closeIcon": "close"
        },

        ui:
        {
        },

        initialize: function(options)
        {
            this.maxHeight = options.maxHeight;
        },

        template:
        {
            type: "handlebars",
            template: commentsEditorTemplate
        },
        
        onRender: function()
        {
            var view = new WorkoutCommentsEditorView({ model: this.model });
            this.$el.find(".editorContainer")
                .html(view.render().$el)
                .css('max-height', this.maxHeight);
        },

        setDirection: function(direction)
        {
            this.$el.addClass(direction);
        }

    });
});