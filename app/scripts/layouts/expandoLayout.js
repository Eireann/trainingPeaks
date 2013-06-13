define(
[
    "TP",
    "hbs!templates/layouts/expandoLayout"
],
function(TP, expandoLayoutTemplate)
{
    return TP.Layout.extend(
    {
        template:
        {
            type: "handlebars",
            template: expandoLayoutTemplate
        },

        regions:
        {
            graphRegion: "#expandoGraphRegion",
            mapRegion: "#expandoMapRegion",
            statsRegion: "#expandoStatsRegion",
            lapsRegion: "#expandoLapsRegion",
            chartsRegion: "#expandoChartsRegion"
        },

        showMap: function()
        {
            $(this.mapRegion.el).removeClass("hidden");
        },

        hideMap: function()
        {
            $(this.mapRegion.el).addClass("hidden");
        }

    });
});