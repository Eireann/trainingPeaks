define(
[
    "TP",
    "views/genericMenuView",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/workoutComments"
],
function(TP, GenericMenuView, UserConfirmationView, deleteConfirmationTemplate, WorkoutCommentsTemplate)
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
            "click .menuButton": "showMenu"
        },

        template:
        {
            type: "handlebars",
            template: WorkoutCommentsTemplate
        },

        onMouseOver: function()
        {
            this.$el.addClass("hover");
            if (this.getMenuOptions().length)
            {
                this.$(".menuButton").show();
            }
        },

        onMouseOut: function(e)
        {
            if (e && e.toElement && $(e.toElement).is(".workoutCommentMenuModalOverlay"))
            {
                return;
            }
            this.$el.removeClass("hover");
            this.$(".menuButton").hide();
        },

        getMenuOptions: function()
        {
            return ['Delete'];
        },

        showMenu: function(e)
        {
            var menuOptions = this.getMenuOptions();
            var menuView = new GenericMenuView({ className: "workoutCommentMenu", labels: menuOptions });
            menuView.on("Delete", this.onDeleteClicked, this);
            menuView.on("Copy", this.onCopyClicked, this);
            menuView.on("close", this.onMouseOut, this);
            menuView.render().bottom(e.pageY).center(e.pageX);
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
        },

        onCopyClicked: function()
        {
            this.notImplemented();
        }

    });
});