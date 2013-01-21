define(
[
    "backbone.marionette",
    "hbs!templates/layouts/calendarLayout"
],
function(Marionette, calendarLayoutTemplate)
{
    "use strict";
    
    return Marionette.Layout.extend(
    {
        fadeIn: function (callback)
        {
            this.$el.fadeIn(500, callback);
        },

        fadeOut: function (callback)
        {
            this.$el.fadeOut(500, callback);
        },
        
        template:
        {
            type: "handlebars",
            template: calendarLayoutTemplate
        },
        regions:
        {
            headerRegion: "#calendarHeader",
            mainRegion: "#calendarContainer",
            footerRegion: "#calendarFooter"
        }
    });
});