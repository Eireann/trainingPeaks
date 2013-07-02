﻿define(
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
            homeRegion: "#homeContainer"
        }
    });
});
