define(
[
    "TP",
    "hbs!templates/layouts/dashboardLayout"
],
function(TP, dashboardLayoutTemplate)
{
    "use strict";

    return TP.Layout.extend(
    {
        template:
        {
            type: "handlebars",
            template: dashboardLayoutTemplate
        },

        regions:
        {
            headerRegion: "#dashboardHeader",
            libraryRegion: "#libraryContainer",
            dashboardRegion: "#dashboardContainer"
        }
    });
});
