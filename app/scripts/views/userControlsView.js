define(
[
    "underscore",
    "TP",
    "views/userSettingsView",
    "hbs!templates/views/userControls"
],
function (_, TP, UserSettingsView, userControlsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: userControlsTemplate
        },

        ui:
        {
            "settingsButton": "#usernameLabel",
            "settingsWrapper": "#settingsContainer"
        },
        
        events:
        {
            "click #usernameLabel": "onUsernameLabelClicked"
        },

        modelEvents:
        {
            "change": "render"
        },
        
        onUsernameLabelClicked: function()
        {
            var userSettingsView = new UserSettingsView({ el: this.ui.settingsWrapper, model: this.model });
            userSettingsView.render();
        }
    });
});