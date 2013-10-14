﻿define(
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
            this.listenTo(this.model.getAccountSettings(), "change", _.bind(this.render, this));
        },

        onUsernameLabelClicked: function(e)
        {
            //document.getSelection().removeAllRanges();
           
            var $target = $(e.currentTarget);
            var offset = $target.offset();
            var targetCenter = offset.left + ($target.width() / 2);
            var arrowOffset = 35;
            this.accountMenu = new AccountMenuView({model: this.model, parentEl: this.$el });

            // center the arrow below user name
            this.accountMenu.render().top(offset.top + 23).left(targetCenter - arrowOffset);
        },

        onUpgradeClicked: function ()
        {
            var userType = this.model.getAccountSettings().get("userType");
            var upgradeURL = userType === 5 ? theMarsApp.apiConfig.coachUpgradeURL : theMarsApp.apiConfig.upgradeURL;
            window.open(upgradeURL.replace("http:","https:"), '_blank');
        }

    };

    _.extend(userControlsViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(userControlsViewBase);
});