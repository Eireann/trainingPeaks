define(
[
    "TP",
    "hbs!templates/views/quickView/hrTabView"
],
function (TP, hrTabTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewHrTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: hrTabTemplate
        }
    });
});
