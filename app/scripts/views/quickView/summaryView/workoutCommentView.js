define(
[
    "TP",
    "views/genericMenuView",
    "views/userConfirmationView",
    "hbs!templates/views/deleteConfirmationView",
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
            "mouseenter": "showMenuButton",
            "mouseleave": "hideMenuButton",
            "click .menuButton": "showMenu"
        },

        template:
        {
            type: "handlebars",
            template: WorkoutCommentsTemplate
        },

        showMenuButton: function()
        {
            this.$(".menuButton").show();
        },

        hideMenuButton: function()
        {
            this.$(".menuButton").hide();
        },

        showMenu: function(e)
        {
            var menuLabels = this.model.get("commenterPersonId") === theMarsApp.user.id ? ['Copy', 'Delete'] : ['Copy'];
            var menuView = new GenericMenuView({ className: "workoutCommentMenu", labels: menuLabels });
            menuView.on("Delete", this.onDeleteClicked, this);
            menuView.on("Copy", this.onCopyClicked, this);
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