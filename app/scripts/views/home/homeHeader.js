define(
[
    "TP",
    "hbs!templates/views/home/homeHeader"
],
function(TP, homeHeaderTemplate)
{
    var HomeHeaderView =
    {

        className: "frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: homeHeaderTemplate
        }
    };

    return TP.ItemView.extend(HomeHeaderView);
});