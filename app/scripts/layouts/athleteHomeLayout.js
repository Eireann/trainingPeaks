define(
[
    "TP",
    "hbs!templates/layouts/athleteHomeLayout"
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
            headerRegion: "#athleteHomeHeader",
            summaryRegion: "#athleteHomeSummary",
            activityFeedRegion: "#athleteHomeActivityFeed",
            podsRegion: "#athleteHomePods"
        }
    });
});
