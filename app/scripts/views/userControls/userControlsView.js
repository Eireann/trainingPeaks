define(
[
    "underscore",
    "TP",
    "views/userControls/coachAndAffiliateCustomizations",
    "views/userControls/accountMenuView",
    "utilities/athlete/userTypes",
    "hbs!templates/views/userControls/userControls"
],
function(_, TP, coachAndAffiliateCustomizations, AccountMenuView, userType, userControlsTemplate)
{
    var userControlsViewBase =
    {
        template:
        {
            type: "handlebars",
            template: userControlsTemplate
        },

        events:
        {
            "click #userName": "onUsernameLabelClicked",
            "click .upgradeButton": "onUpgradeClicked"
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
            this.accountMenu.render().top(offset.top + 23).left(offset.left);
        },

        onUpgradeClicked: function ()
        {
            var userType = theMarsApp.user.get("settings.account.userType");

            if (userType === 5)
            {
                window.open(theMarsApp.apiConfig.coachUpgradeURL, '_blank');
            }
            else if(userType === 6)
            {
                window.open(theMarsApp.apiConfig.upgradeURL, '_blank');
            }
        }

    };

    _.extend(userControlsViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(userControlsViewBase);
});