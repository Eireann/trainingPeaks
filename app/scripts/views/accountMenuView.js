﻿define(
[
    "TP",
    "views/accountMenuView",
    "views/userSettings/userSettingsView",
    "hbs!templates/views/accountMenu"
],
function (TP, AccountMenuView, UserSettingsView, accountMenuTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
        className: "accountSettings",
        
        modal: {
            mask: false,
            shadow: false
        },

        events:
        {
            "click #accountMenuUserSettings": "onUserSettingsClicked",
            "click #accountMenuLogoff": "onLogoffClicked"
        },

        initialize: function (options)
        {
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        template:
        {
            type: "handlebars",
            template: accountMenuTemplate
        },

        onUserSettingsClicked: function()
        {
            var userSettingsView = new UserSettingsView({ model: this.model });
            userSettingsView.render();
            this.close();
        },
        
        onLogoffClicked: function()
        {
            this.close();
            theMarsApp.session.logout();
        }
    });
});