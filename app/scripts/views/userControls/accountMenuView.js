define(
[
    "underscore",
    "TP",
    "shared/views/userSettingsView",
    "hbs!templates/views/userControls/accountMenu"
],
function (_, TP, UserSettingsView, accountMenuTemplate)
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
            this.waitingOn();
            this.model.fetch({ nocache: true }).done(_.bind(this._openUserSettings, this));
        },

        _openUserSettings: function()
        {
            var userSettingsView = new UserSettingsView.OverlayBox({ model: this.model });
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
