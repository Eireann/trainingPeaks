define(
[
    "TP",
    "hbs!templates/layouts/navigationLayout"
],
function(TP, NavigationLayoutTemplate)
{

    return TP.Layout.extend(
    {
        template:
        {
            type: "handlebars",
            template: NavigationLayoutTemplate
        },

        regions:
        {
            userRegion: "#userControlsContainer",
            navigationRegion: "#navigationContainer"
        }
    });
});