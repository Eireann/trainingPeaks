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
                useSpeedOrPace = _.contains([3, 13, 1, 12], sportTypeID) ? "pace" : "speed",  // run, walk, swim, row are "Average Pace", otherwise "Average Speed"
                averagePaceSpeedKey = useSpeedOrPace === "pace" ? "Average Pace" : "Average Speed",
                maximumPaceSpeedKey = useSpeedOrPace === "pace" ? "Maximum Pace" : "Maximum Speed",
                hasSomeTSS = !!(_.compact(_.pluck(lapsData, "trainingStressScoreActual")).length), // some laps have TSS, some don't. So we need to test here at the top level
                rowData = [],
                headerNames,
                empties = {};

            _.each(lapsData, function(lap, i)
            {
                var lapObject = {},
                    fieldsToOmit = [],
                    canShowNGP = sportTypeID === 3 || sportTypeID === 13,
                    canShowNP = !canShowNGP && lap.normalizedPowerActual,
                    canShowIF = lap.intensityFactorActual,
                    TSStype = TP.utils.units.getUnitsLabel("tss", sportTypeID, new TP.Model(lap)),
                    averagePaceOrSpeedValue = useSpeedOrPace === "pace" ? convertToViewUnits(lap.averageSpeed, "pace", null, sportTypeID) : TP.utils.conversion.formatSpeed(lap.averageSpeed),
                    maximumPaceOrSpeedValue = useSpeedOrPace === "pace" ? convertToViewUnits(lap.maximumSpeed, "pace", null, sportTypeID) : TP.utils.conversion.formatSpeed(lap.maximumSpeed);

                lap = _.clone(lap), // we don't want to modify the actual detailData, just format it

                formatLapData.calculateTotalAndMovingTime(lap);

                lapObject = 
                {
                    "Lap": lap.name,
                    "Start": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.begin)),
                    "End": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.end)),
                    "Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.elapsedTime)),
                    "Moving Duration": TP.utils.datetime.format.decimalHoursAsTime(lap.movingTime),
                    "Distance": convertToViewUnits(lap.distance, "distance", null, sportTypeID)
                };

                // add in TSS (if available) with attendant fields based on TSS type
                if (hasSomeTSS)
                {
                    lapObject[TSStype] = TP.utils.conversion.formatTSS(lap.trainingStressScoreActual, {defaultValue: 0});
                    switch (TSStype)
                    {
                        case "TSS":
                            lapObject["Normalized Power"] = canShowNP ? lap.normalizedPowerActual : null;
                            lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                            lapObject["Average Power"] = lap.averagePower;
                            lapObject["Maximum Power"] = lap.maximumPower;
                            break;
                        case "rTSS":
                            lapObject["Normalized Graded Pace"] = canShowNGP ? convertToViewUnits(lap.normalizedSpeedActual, "pace", null, sportTypeID) : null;
                            lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                            lapObject[averagePaceSpeedKey] = convertToViewUnits(lap.averageSpeed, "pace", null, sportTypeID);
                            lapObject[maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
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
                lapObject["Maximum Heart Rate"] = lap.maximumHeartRate;
                lapObject[averagePaceSpeedKey] = averagePaceOrSpeedValue;
                lapObject[maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
                lapObject["Cadence"] = lap.averageCadence;
                lapObject["Calories"] = lap.calories;
                lapObject["Average Power"] = lap.averagePower;
                lapObject["Maximum Power"] = lap.maximumPower;

                lapObject["Intensity Factor"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                lapObject["Elevation Gain"] = convertToViewUnits(lap.elevationGain, "elevation", null, sportTypeID);
                lapObject["Elevation Loss"] = convertToViewUnits(lap.elevationLoss, "elevation", null, sportTypeID);
                lapObject["Energy"] = lap.energy;
                lapObject["Normalized Power"] = canShowNP ? lap.normalizedPowerActual : null;
                lapObject["Normalized Graded Pace"] = canShowNGP ? convertToViewUnits(lap.normalizedSpeedActual, "pace", null, sportTypeID) : null;

                lapObject["Minimum Torque"] = convertToViewUnits(lap.minimumTorque, "torque", null, sportTypeID);
                lapObject["Average Torque"] = convertToViewUnits(lap.averageTorque, "torque", null, sportTypeID);
                lapObject["Maximum Torque"] = convertToViewUnits(lap.maximumTorque, "torque", null, sportTypeID);

                lapObject["Minimum Elevation"] = convertToViewUnits(lap.minimumElevation, "elevation", null, sportTypeID);
                lapObject["Average Elevation"] = convertToViewUnits(lap.averageElevation, "elevation", null, sportTypeID);
                lapObject["Maximum Elevation"] = convertToViewUnits(lap.maximumElevation, "elevation", null, sportTypeID);

                lapObject["Minimum Cadence"] = lap.minimumCadence;
                lapObject["Average Cadence"] = lap.averageCadence;
                lapObject["Maximum Cadence"] = lap.maximumCadence;

                lapObject["Minimum Temp"] = convertToViewUnits(lap.minimumTemp, "temperature", null, sportTypeID);
                lapObject["Average Temp"] = convertToViewUnits(lap.averageTemp, "temperature", null, sportTypeID);
                lapObject["Maximum Temp"] = convertToViewUnits(lap.maximumTemp, "temperature", null, sportTypeID);

                // filter out null values
                for (var key in lapObject)
                {
                    if (!lapObject[key])
                    {
                        if (lapObject[key] === 0) // zeros are meaningful
                        {
                            lapObject[key] = "0";
                        } else {
                            lapObject[key] = null;
                            empties[key] = (empties[key] ? empties[key] + 1 : 1);
                        }
                        
                    }
                }

                rowData.push(lapObject);
            });

            // if a column is empty in EVERY row, remove that entry from each row
            _.each(rowData, function(row)
            {
                _.each(_.keys(empties), function(key)
                {
                    if (empties[key] === rowData.length)
                    {
                        delete row[key];
                    }
                });
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