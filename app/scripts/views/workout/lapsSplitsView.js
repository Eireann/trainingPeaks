define(
[
    "underscore",
    "TP",
    "views/tableView",
    "utilities/workout/formatLapData",
    "utilities/conversion/convertToViewUnits"
],
function(
    _,
    TP,
    TableView,
    formatLapData,
    convertToViewUnits
    )
{
    return TableView.extend(
    {        
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
                sportTypeID = this.model.get('workoutTypeValueId'),
                rowData = [],
                headerNames;

            _.each(lapsData, function(lap, i)
            {
                var lapObject = {};

                formatLapData.calculateTotalAndMovingTime(lap);

                lapObject = 
                {
                    "Lap": "Lap " + (i+1),
                    "Start": lap.begin,
                    "Finish": lap.end,
                    "Duration": lap.elapsedTime,
                    "Moving Time": lap.movingTime,
                    "Distance": lap.distance,
                    "Average Power": lap.averagePower,
                    "Maximum Power": lap.maximumPower,
                    "Average Pace": convertToViewUnits(lap.averageSpeed, "paceUnFormatted", sportTypeID),
                    "Maximum Pace": convertToViewUnits(lap.maximumSpeed, "paceUnFormatted", sportTypeID),
                    "Average Speed": lap.averageSpeed,
                    "Maximum Speed": lap.maximumSpeed,
                    "Calories": lap.calories,
                    "Maximum Cadence": lap.maximumCadence,
                    "Average Cadence": lap.averageCadence
                };

                // here's where we can filter out unneeded properties (depending on workout type)
                // lapObject = _.omit(lapObject, ['Average Pace', 'MaximumPace'])

                rowData.push(lapObject);
            });

            headerNames = _.map(_.keys(rowData[0], function(header_name)
                {
                    return TP.utilities.translate(header_name);
                })
            );

            rowData = _.map(rowData, function(row)
            {
                return _.values(row);
            });

            return {
                headerNames: headerNames,
                rowData: rowData
            };
        }
    });
});