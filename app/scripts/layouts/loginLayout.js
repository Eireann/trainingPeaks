define(
[
    "backbone.marionette",
    "hbs!templates/layouts/loginLayout"
],
function(Marionette, LoginLayoutTemplate)
{
    "use strict";
    
    return Marionette.Layout.extend(
    {
        template:
        {
            type: "handlebars",
            template: LoginLayoutTemplate
        },
        regions:
        {
            headerRegion: "#loginHeader",
            mainRegion: "#loginForm",
            footerRegion: "#loginFooter"
        }
    });
});