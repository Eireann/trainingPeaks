define(
[
    "TP",
    "hbs!templates/layouts/coachHomeLayout"
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
            homeRegion: "#coachHomeContainer"
        }
    });
});
