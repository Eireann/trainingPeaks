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
        fadeIn: function(callback)
        {
            this.$el.fadeIn(500, callback);
        },
        
        fadeOut: function(callback)
        {
            this.$el.fadeOut(500, callback);
        },
        
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