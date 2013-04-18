define(
[
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/workoutComments"
],
function(TP, UserConfirmationView, deleteConfirmationTemplate, WorkoutCommentsTemplate)
{
    return TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "comment",

        events:
        {
            "mouseenter": "onMouseOver",
            "mouseleave": "onMouseOut",
            "click .deleteButton": "onDeleteClicked"
        },

        template:
        {
            type: "handlebars",
            template: WorkoutCommentsTemplate
        },

        onMouseOver: function()
        {
            this.$el.addClass("hover");
        },

        onMouseOut: function(e)
        {
            if (e && e.toElement && $(e.toElement).is(".workoutCommentMenuModalOverlay"))
            {
                return;
            }
            this.$el.removeClass("hover");
        },

        onDeleteClicked: function(e)
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteConfirmed, this);
        },
        
        onDeleteConfirmed: function()
        {
            this.model.collection.remove(this.model);
        }

    });
});