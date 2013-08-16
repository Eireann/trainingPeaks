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
                    "Start": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.begin)),
                    "Finish": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.end)),
                    "Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.elapsedTime)),
                    "Moving Time": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.movingTime)),
                    "Distance": convertToViewUnits(lap.distance, "distance", sportTypeID),
                    "Average Power": lap.averagePower,
                    "Maximum Power": lap.maximumPower,
                    "Average Pace": convertToViewUnits(lap.averageSpeed, "pace", sportTypeID),
                    "Maximum Pace": convertToViewUnits(lap.maximumSpeed, "pace", sportTypeID),
                    "Average Speed": convertToViewUnits(lap.averageSpeed, "speed", sportTypeID),
                    "Maximum Speed": convertToViewUnits(lap.maximumSpeed, "speed", sportTypeID),
                    "Calories": lap.calories,
                    "Maximum Cadence": lap.maximumCadence,
                    "Average Cadence": lap.averageCadence
                };

                // here's where we can filter out unneeded properties (depending on workout type)
                // exaple: lapObject = _.omit(lapObject, ['Average Pace', 'MaximumPace'])

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