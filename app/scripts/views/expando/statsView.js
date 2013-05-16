define(
[
    "TP",
    "hbs!templates/views/expando/statsTemplate"
],
function(
    TP,
    statsTemplate
    )
{
    var expandoStatsView =
    {

        className: "expandoStats",

        template:
        {
            type: "handlebars",
            template: statsTemplate
        },

        serializeData: function()
        {
            var workoutData = this.model.toJSON();


            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.totalStats;

            _.extend(workoutData, lapData);

            workoutData.movingTime = workoutData.totalTime - workoutData.stoppedTime;

            return workoutData;
        }

    };

    return TP.ItemView.extend(expandoStatsView);
});