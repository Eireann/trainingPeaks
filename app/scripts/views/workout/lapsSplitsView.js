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
                    fieldsToOmit = [],
                    canShowNGP = sportTypeID === 3 || sportTypeID === 13,
                    canShowNP = !canShowNGP && lap.normalizedPowerActual,
                    canShowIF = lap.intensityFactorActual,
                    TSStype = TP.utils.units.getUnitsLabel("tss", sportTypeID, new TP.Model(lap));

                formatLapData.calculateTotalAndMovingTime(lap);

                lapObject = 
                {
                    "Lap": "Lap " + (i+1),
                    "Start": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.begin)),
                    "End": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.end)),
                    "Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.elapsedTime)),
                    "Moving Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.movingTime)),
                    "Distance": convertToViewUnits(lap.distance, "distance", sportTypeID)
                };

                // add in TSS (if available) with attendant fields based on TSS type
                if (lap.trainingStressScoreActual)
                {
                    lapObject[TSStype] = Math.round(lap.trainingStressScoreActual);
                    switch (TSStype)
                    {
                        case "TSS":
                            lapObject["Normalized Power"] = canShowNP ? lap.normalizedPowerActual : null;
                            lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                            lapObject["Average Power"] = lap.averagePower;
                            lapObject["Maximum Power"] = lap.maximumPower;
                            break;
                        case "rTSS":
                            lapObject["Normalized Graded Pace"] = canShowNGP ? convertToViewUnits(lap.normalizedSpeedActual, "pace", sportTypeID) : null;
                            lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                            lapObject["Average Pace"] = convertToViewUnits(lap.averageSpeed, "pace", sportTypeID);
                            lapObject["Maximum Pace"] = convertToViewUnits(lap.maximumSpeed, "pace", sportTypeID);
                            break;
                        case "hrTSS":
                        case "tTSS":
                            lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                            lapObject["Average Heart Rate"] = lap.averageHeartRate;
                            lapObject["Maximum Heart Rate"] = lap.maximumHeartRate;
                            lapObject["Minimum Heart Rate"] = lap.minimumHeartRate;
                            break;
                    }
                }

                lapObject["Average Heart Rate"] = lap.averageHeartRate;
                lapObject["Average Pace"] = convertToViewUnits(lap.averageSpeed, "pace", sportTypeID);
                lapObject["Cadence"] = lap.averageCadence;
                lapObject["Calories"] = lap.calories;

                // filter out null values
                for (var key in lapObject)
                {
                    if (!lapObject[key])
                    {
                        delete lapObject[key];
                    }
                }

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