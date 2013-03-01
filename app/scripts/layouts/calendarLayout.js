define(
[
    "TP",
    "hbs!templates/layouts/calendarLayout"
],
function(TP, calendarLayoutTemplate)
{
    "use strict";

    return TP.Layout.extend(
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
            libraryRegion: "#libraryContainer",
            calendarRegion: "#calendarContainer",
            footerRegion: "#calendarFooter"
        }
    });
});