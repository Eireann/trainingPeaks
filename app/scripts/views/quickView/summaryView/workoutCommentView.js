define(
[
    "TP",
    "views/genericMenuView",
    "hbs!templates/views/quickView/workoutComments"
],
function(TP, GenericMenuView, WorkoutCommentsTemplate)
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
            var menuView = new GenericMenuView({ className: "workoutCommentMenu", labels: ['Copy', 'Delete'] });
            menuView.on("Delete", this.onDeleteClicked, this);
            menuView.on("Copy", this.onCopyClicked, this);
            menuView.render().bottom(e.pageY).center(e.pageX);
        },

        onDeleteClicked: function()
        {
            alert('delete');
        },

        onCopyClicked: function()
        {
            alert('copy');
        }

    });
});