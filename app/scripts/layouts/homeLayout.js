define(
[
    "TP",
    "hbs!templates/layouts/homeLayout"
],
function(TP, homeLayoutTemplate)
{

    return TP.Layout.extend(
    {
        template:
        {
            type: "handlebars",
            template: homeLayoutTemplate
        },

        regions:
        {
            headerRegion: "#homeHeader",
            libraryRegion: "#libraryContainer",
            homeRegion: "#homeContainer"
        }
    });
});
