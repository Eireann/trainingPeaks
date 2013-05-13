define(
[
    "TP",
    "hbs!templates/views/expando/mapTemplate"
],
function (TP, mapTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: mapTemplate 
        }
    });
});