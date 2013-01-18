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