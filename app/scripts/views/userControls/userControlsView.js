define(
[
    "underscore",
    "TP",
    "views/userControls/coachAndAffiliateCustomizations",
    "views/accountMenuView",
    "hbs!templates/views/userControls"
],
function(_, TP, coachAndAffiliateCustomizations, AccountMenuView, userControlsTemplate)
{
    var userControlsViewBase =
    {
        template:
        {
            type: "handlebars",
            template: userControlsTemplate
        },

        ui:
        {
            "settingsButton": "#userName"
        },

        events:
        {
            "click #userName": "onUsernameLabelClicked"
        },

        modelEvents:
        {
            "change": "render"
        },

        initialize: function()
        {
            this.initializeCoachAndAffiliateCustomizations();
        },

        onUsernameLabelClicked: function(e)
        {
            //document.getSelection().removeAllRanges();
            
            var offset = $(e.currentTarget).offset();
            this.accountMenu = new AccountMenuView({model: this.model, parentEl: this.$el });
            this.accountMenu.render().top(offset.top + 18).left(offset.left);
        }

    };

    _.extend(userControlsViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(userControlsViewBase);
});