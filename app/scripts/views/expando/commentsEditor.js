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
            // close on mouseup instead of click, 
            // because mousedown triggers a potential blur/autosave event,
            // and then the click event doesn't fire
            "mouseup .closeIcon": "close"
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