define(
[
    "backbone.marionette",
    "hbs!templates/layouts/navigationLayout"
],
function(Marionette, NavigationLayoutTemplate)
{
    "use strict";
    
    return Marionette.Layout.extend(
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