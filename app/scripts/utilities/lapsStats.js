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
    var availableColumns =
    {
        lap:
        {
            id: 1,
            label: "Lap",
            getter: "name"
        },
        start:
        {
            id: 2,
            label: "Start",
            getter: "begin",
            converter: TP.utils.datetime.convert.millisecondsToDecimalHours,
            units: "duration",
            channel: "Time"
        },
        end:
        {
            id: 3,
            label: "End",
            getter: "end",
            converter: TP.utils.datetime.convert.millisecondsToDecimalHours,
            units: "duration",
            channel: "Time"
        },
        duration:
        {
            id: 4,
            label: "Duration",
            getter: "elapsedTime",
            converter: TP.utils.datetime.convert.millisecondsToDecimalHours,
            units: "duration",
            channel: "Time"
        },
        movingTime:
        {
            id: 5,
            label: "Moving Duration",
            getter: "movingTime",
            units: "duration",
            channel: "Time"
        },
        distance:
        {
            id: 6,
            label: "Distance", // Is customized to distance units
            getter: "distance",
            units: "distance",
            channel: "Distance"
        },
        trainingStressScore:
        {
            id: 7,
            label: "TSS", // TODO: Custom Label based on TSS type
            getter: "trainingStressScoreActual",
            units: "tss"
        },
        intensityFactor:
        {
            id: 8,
            label: "IF",
            getter: "intensityFactorActual",
            units: "if"
        },
        averageHeartRate:
        {
            id: 9,
            label: "Avg Heart Rate",
            getter: "averageHeartRate",
            units: "heartrate",
            channel: "HeartRate"
        },
        maximumHeartRate:
        {
            id: 10,
            label: "Max Heart Rate",
            getter: "maximumHeartRate",
            units: "heartrate",
            channel: "HeartRate"
        }, 
        minimumHeartRate:
        {
            id: 11,
            label: "Min Heart Rate",
            getter: "mimimumHeartRate",
            units: "heartrate",
            channel: "HeartRate"
        },
        averageSpeed:
        {
            id: 12,
            label: "Avg Speed",
            getter: "averageSpeed",
            units: "speed",
            channel: "Speed"
        },
        maximumSpeed:
        {
            id: 13,
            label: "Max Speed",
            getter: "maximumSpeed",
            units: "speed",
            channel: "Speed"
        },
        normalizedSpeed:
        {
            id: 14,
            label: "NGP",
            getter: "normalizedSpeedActual",
            units: "speed",
            channel: "Speed"
        },
        averagePower:
        {
            id: 15,
            label: "Avg Power",
            getter: "averagePower",
            units: "power",
            channel: "Power"
        },
        maximumPower:
        {
            id: 16,
            label: "Max Power",
            getter: "maximumPower",
            units: "power",
            channel: "Power"
        },
        normalizedPower:
        {
            id: 17,
            label: "NP",
            getter: "normalizedPowerActual",
            units: "power",
            channel: "Power",
            defaultValue: null // Override 0's
        },
        averageCadence:
        {
            id: 18,
            label: "Cad",
            getter: "averageCadence",
            units: "cadence",
            channel: "Cadence"
        },
        elevationGain:
        {
            id: 19,
            label: "Elev Gain",
            getter: "elevationGain",
            units: "elevation",
            channel: "Elevation"
        },
        elevationLoss:
        {
            id: 20,
            label: "Elev Loss",
            getter: "elevationLoss",
            units: "elevation",
            channel: "Elevation"
        },
        averageTorque:
        {
            id: 21,
            label: "Avg Torque",
            getter: "averageTorque",
            units: "torque",
            channel: "Torque"
        },
        minimumTorque:
        {
            id: 22,
            label: "Min Torque",
            getter: "minimumTorque",
            units: "torque",
            channel: "Torque"
        },
        maximumTorque:
        {
            id: 23,
            label: "Max Torque",
            getter: "maximumTorque",
            units: "torque",
            channel: "Torque"
        },
        energy:
        {
            id: 24,
            label: "Work",
            getter: "energy",
            units: "energy"
        },
        calories:
        {
            id: 25,
            label: "Calories",
            getter: "calories",
            units: "calories"
        }
    };

    var availableColumnsById = _.transform(availableColumns, function(result, column, name)
    {
        result[column.id] = name;
    });

    function LapsStats(options)
    {
        this.model = options.model;
        this.workoutTypeId = this.model.get("workoutTypeValueId");
        this.detailData = this.model.get("detailData");
        this.laps = _.map(this.detailData.get("lapsStats"), _.clone);

        this.tssType = TP.utils.units.getUnitsLabel("tss", this.workoutTypeId, this.model);

        this.columnNames = options.columns ? LapsStats.getColumnNames(options.columns) : this.getDefaultColumnNames();
        this.columns = this.getColumns();
    }

    LapsStats.availableColumns = availableColumns;

    LapsStats.prototype.customizeColumns = function customizeColumns(columns)
    {
        var self = this;
        var usePace = _.contains([3, 13, 1, 12], this.workoutTypeId);
        _.each(columns, function(column, name)
        {
            if(usePace && column.units === "speed")
            {
                column.units = "pace";
                column.label = column.label.replace("Speed", "Pace");
            }

            if(column.name === "distance")
            {
                var label = TP.utils.units.getUnitsLabel("distance", self.workoutTypeId, null, {abbreviated: false});
                column.label = label[0].toUpperCase() + label.substring(1);
            }

            if(column.name === "trainingStressScore")
            {
                column.label = self.tssType;
            }
        });
    };

    LapsStats.prototype.getHeaders = function getHeaders()
    {
        return _.pluck(this.columns, "label");
    };

    LapsStats.getColumnNames = function(columns)
    {
        return _.map(columns, function(column)
        {
            if(_.isString(column))
            {
                return column;
            }
            else
            {
                return availableColumnsById[column];
            }
        });
    };

    LapsStats.getColumnIds = function(columns)
    {
        return _.map(columns, function(column)
        {
            if(_.isString(column))
            {
                return availableColumns[column].id;
            }
            else
            {
                return column;
            }
        });
    };

    LapsStats.prototype.getDefaultColumnNames = function()
    {
        var columnNames = ["lap", "start", "end", "duration", "movingTime", "distance"];
        columnNames.push("trainingStressScore", "intensityFactor");

        // TODO: Only run if we have some TSS values
        switch(this.tssType)
        {
            case "TSS":
                columnNames.push("normalizedPower", "averagePower", "maximumPower");
                break;
            case "rTSS":
                columnNames.push("normalizedSpeed", "averageSpeed", "maximumSpeed");
                break;
            case "hrTSS":
            case "tTSS": 
                columnNames.push("averageHeartRate", "maximumHearRate", "minimumHeartRate");
                break;
        }

        columnNames.push("averageHeartRate", "maximumHeartRate");
        columnNames.push("averageSpeed", "maximumSpeed", "averageCadence", "averagePower", "maximumPower");
        columnNames.push("elevationGain", "elevationLoss", "normalizedPower", "normalizedSpeed");
        columnNames.push("minimumTorque", "averageTorque", "maximumTorque");
        columnNames.push("energy", "calories");

        if(_.contains([3, 13], this.workoutTypeId))
        {
            // Run and walk should use NGP not NP
            columnNames = _.without(columnNames, "normalizedPower");
        }
        else
        {
            // Others should use NP not NGP
            columnNames = _.without(columnNames, "normalizedSpeed");
        }

        // Remove duplicates from TSS type
        return _.uniq(columnNames);
    };

    LapsStats.prototype.getColumns = function getColumns()
    {
        var self = this;

        var columns = _.map(this.columnNames, function(name)
        {
            return _.extend({ name: name }, availableColumns[name]);
        });

        // Customize labels, units, etc.
        this.customizeColumns(columns);

        var availableChannels = _.clone(this.detailData.get("availableDataChannels"));
        availableChannels.push("Time"); // Time is never in the available channels, as it isn't a "real" channel

        columns = _.select(columns, function(column)
        {
            var isAvailable = !column.channel || _.contains(availableChannels, column.channel);
            var hasData = _.any(self.laps, function(lap)
            {
                formatLapData.calculateTotalAndMovingTime(lap);
                var value = self.processCell(column, lap, { format: false });
                return value !== null && value !== undefined;
            });
            return isAvailable && hasData;
        });

        return columns;
    };

    LapsStats.prototype.processRows = function(options)
    {
        var self = this;
        return _.map(this.laps, function(row) { return self.processRow(row, options); });
    };

    LapsStats.prototype.processRow = function(row, options)
    {
        var self = this;
        return _.map(this.columns, function(column)
        {
            return self.processCell(column, row, options);
        });
    };

    LapsStats.prototype.processColumns = function(options)
    {
        var self = this;
        return _.map(this.columns, function(column)
        {
            return { meta: column, data: self.processColumn(column, options) };
        });
    };

    LapsStats.prototype.processColumn = function(column, options)
    {
        var self = this;
        return _.map(this.laps, function(row) { return self.processCell(column, row, options); });
    };



    LapsStats.prototype.processCell = function(column, row, options)
    {
        options = options || { format: true };

        var formatOptions = { defaultValue: "--", workoutTypeId: this.workoutTypeId, seconds: false };
        if(_.isObject(options.format))
        {
            _.extend(formatOptions, options.format);
        }
        var value = _.result(row, column.getter);

        if(_.has(column, "defaultValue") && !value) value = column.defaultValue;

        if(column.converter) value = column.converter.call(row, value);

        if(options.format)
        {
            if(column.units) value = TP.utils.conversion.formatUnitsValue(column.units, value, formatOptions);
            else if(column.formatter) value = column.formatter.call(row, value);
            // TODO: What should happen here really?
        }
        return value;
    };

    return LapsStats;
});
