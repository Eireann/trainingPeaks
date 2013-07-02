define(
[
    "underscore",
    "TP",
    "hbs!templates/views/home/athlete/athleteHomeHeader"
],
function(
    _,
    TP,
    headerTemplate
    )
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: headerTemplate
        }
    });
});