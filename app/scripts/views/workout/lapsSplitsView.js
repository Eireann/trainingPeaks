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
                var lapObject = {},
                    fieldsToOmit = [];

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
                    "Normalized Power": lap.normalizedPowerActual,
                    "Average Pace": convertToViewUnits(lap.averageSpeed, "pace", sportTypeID),
                    "Maximum Pace": convertToViewUnits(lap.maximumSpeed, "pace", sportTypeID),
                    "Normalized Graded Pace": convertToViewUnits(lap.normalizedSpeedActual, "pace", sportTypeID),
                    "Average Speed": convertToViewUnits(lap.averageSpeed, "speed", sportTypeID),
                    "Maximum Speed": convertToViewUnits(lap.maximumSpeed, "speed", sportTypeID),
                    "Calories": lap.calories,
                    "Maximum Cadence": lap.maximumCadence,
                    "Average Cadence": lap.averageCadence,
                    "TSS": Math.round(lap.trainingStressScoreActual)
                };

                // here's where we can filter out unneeded properties (depending on workout type)
                if (sportTypeID !== 3 && sportTypeID !== 13)
                {
                    fieldsToOmit.push('Normalized Graded Pace');
                }
                if (!lap.normalizedPowerActual)
                {
                    fieldsToOmit.push('Normalized Power');
                }
                if (!lap.trainingStressScoreActual)
                {
                    fieldsToOmit.push('TSS');
                }
                lapObject = _.omit(lapObject, fieldsToOmit);

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