define(
[
    "TP",
    "hbs!templates/views/userUpgradeView"
],
function (TP, userUpgradeTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "userUpgradeView dialog",

        events:
        {
            "click #userConfirm": "close"
        },

        template:
        {
            type: "handlebars",
            template: userUpgradeTemplate
        }

    });
});