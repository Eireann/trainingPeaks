define(
[
    "TP",
    "hbs!templates/layouts/navigationLayout"
],
function(TP, NavigationLayoutTemplate)
{
    "use strict";

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