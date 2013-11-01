define(
[
    "underscore",
    "TP",
    "utilities/workout/formatLapData"
],
function(
    _,
    TP,
    formatLapData
    )
{
    var channelToStatsMap = {
        Power: ["Avg Power", "Max Power", "NP"],
        Elevation: ["Elev Gain", "Elev Loss"],
        Speed: ["Avg Speed", "Avg Pace", "Max Speed", "Max Pace", "NGP"],
        HeartRate: ["Avg Heart Rate", "Max Heart Rate", "Min Heart Rate"],
        Torque: ["Min Torque", "Max Torque", "Avg Torque"],
        Cadence: ["Cad"]
    };

    var LapsStats = {

        getDefaults: function(model)
        {
            var lapsData = model.get('detailData').get('lapsStats'),
                sportTypeID = model.get('workoutTypeValueId'),
                useSpeedOrPace = _.contains([3, 13, 1, 12], sportTypeID) ? "pace" : "speed",  // run, walk, swim, row are "Avg Pace", otherwise "Avg Speed"
                distanceKey = TP.utils.units.getUnitsLabel("distance", sportTypeID, null, {abbreviated: false}),
                hasSomeTSS = !!(_.compact(_.pluck(lapsData, "trainingStressScoreActual")).length), // some laps have TSS, some don't. So we need to test here at the top level
                TSStype = TP.utils.units.getUnitsLabel("tss", sportTypeID, new TP.Model(lapsData && lapsData.length ? lapsData[0] : {})); // get tss type from first model as some laps may have different tss source

            return {
                lapsData: lapsData,
                sportTypeID: sportTypeID,
                useSpeedOrPace: useSpeedOrPace,  // run, walk, swim, row are "Avg Pace", otherwise "Avg Speed"
                averagePaceSpeedKey: useSpeedOrPace === "pace" ? "Avg Pace" : "Avg Speed",
                maximumPaceSpeedKey: useSpeedOrPace === "pace" ? "Max Pace" : "Max Speed",
                // capitalize first letter of distance key for header row
                // Can't do it with CSS because some headers need lower case first letters (e.g. rTSS)
                distanceKey: distanceKey[0].toUpperCase() + distanceKey.substring(1),
                hasSomeTSS: hasSomeTSS,
                TSStype: TSStype
            };
        },

        buildLapObjects: function(workoutDefaults, availableChannels)
        {
            var rowData = [],
                empties = {};

            _.each(workoutDefaults.lapsData, function(lap)
            {
                this.formatLapObject(lap, workoutDefaults, rowData, empties, availableChannels);
            }, this);
            return [rowData, empties];
        },

        formatLapObject: function(rawLapData, workoutDefaults, formattedLapData, empties, availableChannels)
        {
            var formatOptions = { defaultValue: null, allowZero: true, workoutTypeId: workoutDefaults.sportTypeID};

            var lapObject = {},
                fieldsToOmit = [],
                canShowNGP = workoutDefaults.sportTypeID === 3 || workoutDefaults.sportTypeID === 13,
                canShowNP = !canShowNGP && rawLapData.normalizedPowerActual,
                canShowIF = rawLapData.intensityFactorActual,
                TSStype = workoutDefaults.TSStype,
                //TSStype = TP.utils.units.getUnitsLabel("tss", workoutDefaults.sportTypeID, new TP.Model(lap)),
                averagePaceOrSpeedValue = workoutDefaults.useSpeedOrPace === "pace" ? TP.utils.conversion.formatUnitsValue("pace", rawLapData.averageSpeed, formatOptions) : TP.utils.conversion.formatSpeed(rawLapData.averageSpeed, formatOptions),
                maximumPaceOrSpeedValue = workoutDefaults.useSpeedOrPace === "pace" ? TP.utils.conversion.formatUnitsValue("pace", rawLapData.maximumSpeed, formatOptions) : TP.utils.conversion.formatSpeed(rawLapData.maximumSpeed, formatOptions);

            var lap = _.clone(rawLapData); // we don't want to modify the actual detailData, just format it

            formatLapData.calculateTotalAndMovingTime(lap);

            lapObject =
            {
                "Lap": lap.name,
                "Start": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.begin)),
                "End": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.end)),
                "Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.elapsedTime)),
                "Moving Duration": TP.utils.datetime.format.decimalHoursAsTime(lap.movingTime)
            };

            lapObject[workoutDefaults.distanceKey] = TP.utils.conversion.formatUnitsValue("distance", lap.distance, formatOptions);

            // add in TSS (if available) with attendant fields based on TSS type
            if (workoutDefaults.hasSomeTSS)
            {
                lapObject[TSStype] = TP.utils.conversion.formatUnitsValue("tss", lap.trainingStressScoreActual, formatOptions);
                lapObject["IF"] = canShowIF ? TP.utils.conversion.formatUnitsValue("if", lap.intensityFactorActual) : null;
                switch (TSStype)
                {
                    case "TSS":
                        lapObject["NP"] = canShowNP ? TP.utils.conversion.formatUnitsValue("power", lap.normalizedPowerActual, formatOptions) : null;
                        lapObject["Avg Power"] = TP.utils.conversion.formatUnitsValue("power", lap.averagePower, formatOptions);
                        lapObject["Max Power"] = TP.utils.conversion.formatUnitsValue("power", lap.maximumPower, formatOptions);
                        break;
                    case "rTSS":
                        lapObject["NGP"] = canShowNGP ? TP.utils.conversion.formatUnitsValue("pace", lap.normalizedSpeedActual, formatOptions) : null;
                        lapObject[workoutDefaults.averagePaceSpeedKey] = TP.utils.conversion.formatUnitsValue("speed", lap.averageSpeed, formatOptions);
                        lapObject[workoutDefaults.maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
                        break;
                    case "hrTSS":
                    case "tTSS":
                        lapObject["Avg Heart Rate"] = TP.utils.conversion.formatUnitsValue("heartrate", lap.averageHeartRate, formatOptions);
                        lapObject["Max Heart Rate"] = TP.utils.conversion.formatUnitsValue("heartrate", lap.maximumHeartRate, formatOptions);
                        lapObject["Min Heart Rate"] = TP.utils.conversion.formatUnitsValue("heartrate", lap.minimumHeartRate, formatOptions);
                        break;
                }
            }

            lapObject["Avg Heart Rate"] = TP.utils.conversion.formatUnitsValue("heartrate", lap.averageHeartRate, formatOptions);
            lapObject["Max Heart Rate"] = TP.utils.conversion.formatUnitsValue("heartrate", lap.maximumHeartRate, formatOptions);

            lapObject[workoutDefaults.averagePaceSpeedKey] = averagePaceOrSpeedValue;
            lapObject[workoutDefaults.maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
            lapObject["Cad"] = TP.utils.conversion.formatUnitsValue("cadence", lap.averageCadence, formatOptions);
            lapObject["Avg Power"] = TP.utils.conversion.formatUnitsValue("power", lap.averagePower, formatOptions);
            lapObject["Max Power"] = TP.utils.conversion.formatUnitsValue("power", lap.maximumPower, formatOptions);

            lapObject["Elev Gain"] = TP.utils.conversion.formatUnitsValue("elevationGain", lap.elevationGain, formatOptions);
            lapObject["Elev Loss"] = TP.utils.conversion.formatUnitsValue("elevationLoss", lap.elevationLoss, formatOptions);

            lapObject["NP"] = canShowNP ? TP.utils.conversion.formatUnitsValue("power", lap.normalizedPowerActual, formatOptions) : null;
            lapObject["NGP"] = canShowNGP ? TP.utils.conversion.formatUnitsValue("pace", lap.normalizedSpeedActual, formatOptions) : null;


            lapObject["Min Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.minimumTorque, formatOptions);
            lapObject["Avg Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.averageTorque, formatOptions);
            lapObject["Max Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.maximumTorque, formatOptions);

            lapObject["Work"] = TP.utils.conversion.formatUnitsValue("energy", lap.energy, formatOptions);
            lapObject["Calories"] = TP.utils.conversion.formatUnitsValue("calories", lap.calories, formatOptions);

            // remove channels that have been cut
            this._removeUnavailableChannels(lapObject, availableChannels);

            // filter out null values that are null across all rows, and display any remaining null values as "--"
            var defaultDisplayValue = "--";
            for (var key in lapObject)
            {
                if(!lapObject[key])
                {
                    if (lapObject[key] === 0) // zeros are meaningful
                    {
                        lapObject[key] = "0";
                    } else {
                        lapObject[key] = defaultDisplayValue;
                        empties[key] = (empties[key] ? empties[key] + 1 : 1);
                    }
                }
            }

            formattedLapData.push(lapObject);
        },

        compactLapObjects: function(lapObjects, empties)
        {
            _.each(lapObjects, function(row)
            {
                _.each(_.keys(empties), function(key)
                {
                    if (empties[key] === lapObjects.length)
                    {
                        delete row[key];
                    }
                });
            });
            return lapObjects;
        },

        // The other entries will be the laps splits data
        buildLapTableData: function(keyNames, rowData)
        {
            var formattedLaps = _.map(rowData, function(row) {
                var tmp = {};

                _.each(row, function(valueName, index) {
                    tmp[keyNames[index]] = valueName;
                });
                return tmp;
            });

            return formattedLaps;
        },

        buildHeaderNames: function(lapObject)
        {
            return _.map(_.keys(lapObject, function(header_name)
                {
                    return TP.utilities.translate(header_name);
                })
            );
        },

        _removeUnavailableChannels: function(lapObject, availableChannels)
        { 
            _.each(channelToStatsMap, function(lapFieldNames, channelName)
            {
                if(!_.contains(availableChannels, channelName))
                {
                    _.each(lapFieldNames, function(fieldName){
                        if(lapObject.hasOwnProperty(fieldName))
                        {
                            lapObject[fieldName] = null;
                        }
                    });
                }
            });
        }

    };

    return LapsStats;
});
