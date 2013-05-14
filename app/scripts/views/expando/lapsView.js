define(
[
    "TP",
    "hbs!templates/views/expando/lapsTemplate"
],
function (TP, lapsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: lapsTemplate
        }
    });
});