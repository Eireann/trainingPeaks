define(
[
    "TP",
    "shared/views/userSettingsView",
    "hbs!templates/views/userControls/accountMenu"
],
function (TP, UserSettingsView, accountMenuTemplate)
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
            "click #accountMenuHelp": "onHelpClicked",
            "click #accountMenuSwitchToFlex": "onSwitchToFlex",
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

        onHelpClicked: function()
        {
            window.open(window.apiConfig ? window.apiConfig.helpURL : "");
            this.close();
        },

        onSwitchToFlex: function()
        {
            window.open(window.apiConfig ? window.apiConfig.cmsRoot + "/flex" : "");
            this.close();
        },
        
        onLogoffClicked: function()
        {
            this.close();
            theMarsApp.session.logout();
        }
    });
});
