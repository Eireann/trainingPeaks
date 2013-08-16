define(
[
    "underscore",
    "TP",
    "utilities/workout/formatLapData",
    "utilities/conversion/convertToViewUnits",
    "hbs!templates/views/workout/lapsSplitsView"
],
function(
    _,
    TP,
    formatLapData,
    convertToViewUnits,
    lapsSplitsTemplate
    )
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: lapsSplitsTemplate
        },
        tagName: "table",
        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
        },
        serializeData: function()
        {
            var lapsData = this.model.get('detailData').get('lapsStats'),
                sportTypeID = this.model.get('workoutTypeValueId');
            _.each(lapsData, function(lap)
            {
                formatLapData.calculateTotalAndMovingTime(lap);
                lap.averagePace = convertToViewUnits(lap.averageSpeed, "paceUnFormatted", sportTypeID);
                lap.maximumPace = convertToViewUnits(lap.maximumSpeed, "paceUnFormatted", sportTypeID);
            });
            return {
                laps: lapsData
            };
        }
    });
});