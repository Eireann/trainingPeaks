﻿define(
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
            $("#expandoLeftColumn").removeClass("mapHidden");
        },

        hideMap: function()
        {
            $("#expandoLeftColumn").addClass("mapHidden");
        },

        showGraph: function()
        {
            $("#expandoLeftColumn").removeClass("graphHidden");
        },

        hideGraph: function()
        {
            $("#expandoLeftColumn").addClass("graphHidden");
        }

    });
});