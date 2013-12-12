define(
[
    "underscore",
    "TP",
    "slick.core",
    "slick.grid"
],
function(
    _,
    TP,
    Slick,
    SlickGrid
)
{

    var DataView = function(sampleData, columns, stateModel)
    {
        this.sampleData = sampleData;
        this.columns = columns;
        this.stateModel = stateModel;
        this.channels = this.sampleData.getChannels(_.pluck(this.columns, "id"));
    };

    _.extend(DataView.prototype,
    {
        getLength: function()
        {
            return this.sampleData.length;
        },

        getItem: function(index)
        {
            return this.channels.get(index);
        },

        getItemMetadata: function(index)
        {
            var offset = this.sampleData.get("time", index);

            var inRange = this.stateModel.get("ranges").any(function(range)
            {
                return offset >= range.get("begin") && offset <= range.get("end");
            });

            var primaryRange = this.stateModel.get("primaryRange");
            var inPrimaryRange = primaryRange && offset >= primaryRange.get("begin") && offset <= primaryRange.get("end");

            var classes = [];

            if(inRange) { classes.push('sampleInRange'); }
            if(inPrimaryRange) { classes.push('sampleInPrimaryRange'); }

            return {
                cssClasses: classes.join(' ')
            };
        }
    });

    var DataGridView = TP.ItemView.extend({

        className: "dataGrid",

        render: function() {},

        channels: [
            {
                id: "MillisecondOffset",
                name: "Time",
                units: "milliseconds"
            },
            {
                id: "Distance",
                name: "Distance",
                units: "distance"
            },
            {
                id: "Elevation",
                name: "Elevation",
                units: "elevation"
            },
            {
                id: "Cadence",
                name: "Cadence",
                units: "cadence"
            },
            {
                id: "HeartRate",
                name: "Heart Rate",
                units: "heartrate"
            },
            {
                id: "Power",
                name: "Power",
                units: "power"
            },
            {
                id: "RightPower",
                name: "Right Power",
                units: "power"
            },
            {
                id: "PowerBalance",
                name: "Power Balance",
                units: "powerbalance"
            },
            {
                id: "Speed",
                name: "Speed",
                units: "speed"
            },
            {
                id: "Temperature",
                name: "Temperature",
                units: "temperature"
            },
            {
                id: "Torque",
                name: "Torque",
                units: "torque"
            },
            {
                id: "Longitude",
                name: "Longitude",
                units: "longitude"
            },
            {
                id: "Latitude",
                name: "Latitude",
                units: "latitude"
            }
        ],

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.on("pod:resize", _.bind(this._resize, this));
            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._invalidate, this));
            this.listenTo(this.stateModel.get("ranges"), "add remove", _.bind(this._invalidate, this));
        },

        onShow: function()
        {
            var self = this;
            var graphData = this.model.get("detailData").graphData;
            var availableChannels = this.model.get("detailData").get("availableDataChannels");

            var columns = _.chain(this.channels)
            .filter(function(channel) { return _.include(availableChannels, channel.id); })
            .map(function(channel, i)
            {
                return _.extend({ field: i, width: 100 }, channel);
            }).value();

            var workoutType = self.model.get("workoutTypeValueId");
            _.each(columns, function(column)
            {
                if(column.units)
                {
                    var label = TP.utils.units.getUnitsLabel(column.units, workoutType);
                    column.name += label ? " (" + label + ")" : "";
                    column.formatter = function(row, cell, value)
                    {
                        return TP.utils.conversion.formatUnitsValue(column.units, value, { workoutTypeId: workoutType });
                    };
                }
            });

            var options =
            {
                fullWidthRows: true,
                syncColumnCellResize: true,
                enableColumnReorder: false
            };

            this.grid = new Slick.Grid(this.$el, new DataView(graphData.sampleData, columns, this.stateModel), columns, options);
        },

        _invalidate: function()
        {
            if(this.grid) { this.grid.invalidate(); }
        },

        _resize: function()
        {
            if(this.grid) { this.grid.resizeCanvas(); }
        }

    });

    return DataGridView;
});
