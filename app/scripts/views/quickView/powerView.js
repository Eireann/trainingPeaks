define(
[
    "TP",
    "hbs!templates/views/quickView/powerTabView"
],
function (TP, powerTabTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewPowerTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: powerTabTemplate
        }
    });
});
