define(
[
    "TP",
    "hbs!templates/layouts/dashboardLayout"
],
function(TP, dashboardLayoutTemplate)
{

    return TP.Layout.extend(
    {

        attributes: { style: "height: 100%;" },

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
