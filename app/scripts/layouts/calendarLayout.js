define(
[
    "TP",
    "hbs!templates/layouts/calendarLayout"
],
function(TP, calendarLayoutTemplate)
{

    return TP.Layout.extend(
    {
        
        attributes: { style: "height: 100%;" },

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
