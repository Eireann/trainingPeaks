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
            packeryRegion: ".expandoPackeryRegion",
            statsRegion: ".expandoStatsRegion",
            lapsRegion: ".expandoLapsRegion",
            editControlsRegion: ".expandoEditControlsRegion"
        }
    });
});
