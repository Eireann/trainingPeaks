define(
[
    "TP",
    "hbs!templates/views/quickView/paceTabView"
],
function (TP, paceTabTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewPaceTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: paceTabTemplate
        }
    });
});
