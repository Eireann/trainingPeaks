define(
[
    "underscore",
    "TP",
    "utilities/workout/formatLapData",
    "hbs!templates/views/expando/lapsSplitsTemplate"
],
function(
    _,
    TP,
    formatLapData,
    lapsSplitsTemplate
    )
{
    return TP.ItemView.extend(
    {        
        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
            this.detailDataPromise = options.detailDataPromise;
        },
        template:
        {
            type: "handlebars",
            template: lapsSplitsTemplate
        },
        onShow: function()
        {
            // if model has no laps/splits, tell controller to close this view
            var self = this;
            this.detailDataPromise.done(function()
            {
                if (!self.model.get('detailData').get('lapsStats'))
                {
                    self.trigger("requestClose", self);
                }
            });
        },
        serializeData: function()
        {
            var workoutDefaults = this._getDefaults(),
                buildResults = this._buildLapObjects(workoutDefaults),
                lapObjects = buildResults[0],
                emptyKeyCounts = buildResults[1],
                compactedLapObjects = this._compactLapObjects(lapObjects, emptyKeyCounts),
                rowData = [],
                headerNames;

            headerNames = _.map(_.keys(compactedLapObjects[0], function(header_name)
                {
                    return TP.utilities.translate(header_name);
                })
            );

            rowData = _.map(compactedLapObjects, function(row)
            {
                return _.values(row);
            });

            return {
                headerNames: headerNames,
                rowData: rowData
            };
        },
        _getDefaults: function()
        {
            var lapsData = this.model.get('detailData').get('lapsStats'),
                sportTypeID = this.model.get('workoutTypeValueId'),
                useSpeedOrPace = _.contains([3, 13, 1, 12], sportTypeID) ? "pace" : "speed",  // run, walk, swim, row are "Avg Pace", otherwise "Avg Speed"
                distanceKey = TP.utils.units.getUnitsLabel("distance", sportTypeID, null, {abbreviated: false}),
                hasSomeTSS = !!(_.compact(_.pluck(lapsData, "trainingStressScoreActual")).length); // some laps have TSS, some don't. So we need to test here at the top level

            return {
                lapsData: lapsData,
                sportTypeID: sportTypeID,
                useSpeedOrPace: useSpeedOrPace,  // run, walk, swim, row are "Avg Pace", otherwise "Avg Speed"
                averagePaceSpeedKey: useSpeedOrPace === "pace" ? "Avg Pace" : "Avg Speed",
                maximumPaceSpeedKey: useSpeedOrPace === "pace" ? "Max Pace" : "Max Speed",
                // capitalize first letter of distance key for header row
                // Can't do it with CSS because some headers need lower case first letters (e.g. rTSS)
                distanceKey: distanceKey[0].toUpperCase() + distanceKey.substring(1),
                hasSomeTSS: !!(_.compact(_.pluck(lapsData, "trainingStressScoreActual")).length) // some laps have TSS, some don't. So we need to test here at the top level
            };
        },
        _buildLapObjects: function(workoutDefaults)
        {
            var rowData = [],
                empties = {};
            _.each(workoutDefaults.lapsData, function(lap, i)
            {
                var lapObject = {},
                    fieldsToOmit = [],
                    canShowNGP = workoutDefaults.sportTypeID === 3 || workoutDefaults.sportTypeID === 13,
                    canShowNP = !canShowNGP && lap.normalizedPowerActual,
                    canShowIF = lap.intensityFactorActual,
                    TSStype = TP.utils.units.getUnitsLabel("tss", workoutDefaults.sportTypeID, new TP.Model(lap)),
                    averagePaceOrSpeedValue = workoutDefaults.useSpeedOrPace === "pace" ? TP.utils.conversion.formatUnitsValue("pace", lap.averageSpeed, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID}) : TP.utils.conversion.formatSpeed(lap.averageSpeed),
                    maximumPaceOrSpeedValue = workoutDefaults.useSpeedOrPace === "pace" ? TP.utils.conversion.formatUnitsValue("pace", lap.maximumSpeed, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID}) : TP.utils.conversion.formatSpeed(lap.maximumSpeed);

                lap = _.clone(lap); // we don't want to modify the actual detailData, just format it

                formatLapData.calculateTotalAndMovingTime(lap);

                lapObject = 
                {
                    "Lap": lap.name,
                    "Start": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.begin)),
                    "End": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.end)),
                    "Duration": TP.utils.datetime.format.decimalHoursAsTime(TP.utils.datetime.convert.millisecondsToDecimalHours(lap.elapsedTime)),
                    "Moving Duration": TP.utils.datetime.format.decimalHoursAsTime(lap.movingTime)
                };

                lapObject[workoutDefaults.distanceKey] = TP.utils.conversion.formatUnitsValue("distance", lap.distance, { defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});

                // add in TSS (if available) with attendant fields based on TSS type
                if (workoutDefaults.hasSomeTSS)
                {
                    lapObject[TSStype] = TP.utils.conversion.formatTSS(lap.trainingStressScoreActual, {defaultValue: 0});
                    lapObject["IF"] = canShowIF ? TP.utils.conversion.formatIF(lap.intensityFactorActual) : null;
                    switch (TSStype)
                    {
                        case "TSS":
                            lapObject["NP"] = canShowNP ? lap.normalizedPowerActual : null;
                            lapObject["Avg Power"] = lap.averagePower;
                            lapObject["Max Power"] = lap.maximumPower;
                            break;
                        case "rTSS":
                            lapObject["NGP"] = canShowNGP ? TP.utils.conversion.formatUnitsValue("pace", lap.normalizedSpeedActual, { defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID }) : null;
                            lapObject[workoutDefaults.averagePaceSpeedKey] = TP.utils.conversion.formatUnitsValue("speed", lap.averageSpeed, { defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});
                            lapObject[workoutDefaults.maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
                            break;
                        case "hrTSS":
                        case "tTSS":
                            lapObject["Avg Heart Rate"] = lap.averageHeartRate;
                            lapObject["Max Heart Rate"] = lap.maximumHeartRate;
                            lapObject["Min Heart Rate"] = lap.minimumHeartRate;
                            break;
                    }
                }

                lapObject["Avg Heart Rate"] = lap.averageHeartRate;
                lapObject["Max Heart Rate"] = lap.maximumHeartRate;
                lapObject[workoutDefaults.averagePaceSpeedKey] = averagePaceOrSpeedValue;
                lapObject[workoutDefaults.maximumPaceSpeedKey] = maximumPaceOrSpeedValue;
                lapObject["Cad"] = lap.averageCadence;
                lapObject["Avg Power"] = lap.averagePower;
                lapObject["Max Power"] = lap.maximumPower;

                lapObject["Elev Gain"] = TP.utils.conversion.formatUnitsValue("elevationGain", lap.elevationGain, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});
                lapObject["Elev Loss"] = TP.utils.conversion.formatUnitsValue("elevationLoss", lap.elevationLoss, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});

                lapObject["NP"] = canShowNP ? lap.normalizedPowerActual : null;
                lapObject["NGP"] = canShowNGP ? TP.utils.conversion.formatUnitsValue("pace", lap.normalizedSpeedActual, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID}) : null;


                lapObject["Min Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.minimumTorque, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});
                lapObject["Avg Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.averageTorque, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});
                lapObject["Max Torque"] = TP.utils.conversion.formatUnitsValue("torque", lap.maximumTorque, {defaultValue: null, workoutTypeId: workoutDefaults.sportTypeID});

                lapObject["Work"] = TP.utils.conversion.formatEnergy(lap.energy);
                lapObject["Calories"] = lap.calories;

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
            return [rowData, empties];
        },
        _compactLapObjects: function(lapObjects, empties)
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
        }
    });
});
