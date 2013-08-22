define(
[
    "TP",
    "hbs!templates/views/user/userSettingsView"
],
function (
          TP,
          userSettingsViewTemplate
          )
{
    return TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "userSettings",
       
        modal: true,

        template:
        {
            type: "handlebars",
            template: userSettingsViewTemplate
        },

        events:
        {
            "click #closeIcon": "close"
        }
    });
});