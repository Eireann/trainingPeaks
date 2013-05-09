define(
[
    "TP",
    "hbs!templates/layouts/loginLayout"
],
function(TP, LoginLayoutTemplate)
{
    "use strict";

    return TP.Layout.extend(
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