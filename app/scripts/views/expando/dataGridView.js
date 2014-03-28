define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "slick.core",
    "slick.grid"
],
function(
    $,
    _,
    setImmediate,
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
            var item = this.channels.get(index);

            // item is a stop if all values are null, except for the first column which is time
            item.isStopped = ! _.any(item.slice(1), function(value) { return value !== null; });

            return item;
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

            var item = this.getItem(index);
            if(item.isStopped) { classes.push('stopped'); }

            return {
                cssClasses: classes.join(' ')
            };
        }
    });

    var DataGridView = TP.ItemView.extend({

        podTitle: "Data Grid",
        template: _.template("<div class='dataGrid'></div>"),

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
                id: "Speed",
                name: "Speed",
                units: "speed"
            },
            {
                id: "HeartRate",
                name: "Heart Rate",
                units: "heartrate"
            },
            {
                id: "Cadence",
                name: "Cadence",
                units: "cadence"
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
                id: "Elevation",
                name: "Elevation",
                units: "elevation"
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
                id: "Latitude",
                name: "Latitude",
                units: "latitude"
            },
            {
                id: "Longitude",
                name: "Longitude",
                units: "longitude"
            }
        ],

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.on("pod:resize", _.bind(this._resize, this));

            this.sampleData = this.model.get("detailData").graphData.sampleData;

            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._invalidate, this));
            this.listenTo(this.stateModel.get("ranges"), "add remove", _.bind(this._invalidate, this));

            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._gotoPrimaryRange, this));
            this.listenTo(this.stateModel, "goto", _.bind(this._gotoDefault, this));
        },

        onRender: function()
        {
            var self = this;
            var availableChannels = this.model.get("detailData").get("availableDataChannels");

            var columns = _.chain(this.channels)
            .filter(function(channel) { return _.include(availableChannels, channel.id); })
            .map(function(channel, i)
            {
                return _.defaults({}, channel, { field: i, width: 100, resizable: false, focusable: false, selectable: false });
            }).value();

            var workoutType = self.model.get("workoutTypeValueId");
            _.each(columns, function(column)
            {
                if(column.units)
                {
                    if(column.units === "speed" && _.contains([1,3,13,12], workoutType))
                    {
                        column.units = "pace";
                        column.name = "Pace";
                    }

                    var label = TP.utils.units.getUnitsLabel(column.units, workoutType);
                    column.name += label ? " (" + label + ")" : "";
                    column.formatter = function(row, cell, value, columnMetaData, item)
                    {
                        if(item.isStopped)
                        {
                            return column.name === "Time" ? "STOPPED" : "";
                        }
                        else
                        {
                            return TP.utils.conversion.formatUnitsValue(column.units, value, { defaultValue: "--", workoutTypeId: workoutType });
                        }
                    };
                }
            });

            var options =
            {
                fullWidthRows: true,
                syncColumnCellResize: true,
                explicitInitialization: true
            };

            var $grid = this.$(".dataGrid");

            setImmediate(function()
            {
                self.grid = new Slick.Grid($grid, new DataView(self.sampleData, columns, self.stateModel), columns, options);
                self.grid.onHeaderCellRendered.subscribe(function(e, args)
                {
                    var $header = $(args.node).find(".slick-column-name");
                    $header.attr("title", $header.text());
                });

                self.grid.init();
            });

        },


        _gotoPrimaryRange: function()
        {
            this._gotoDefault();
        },

        _gotoDefault: function(offset)
        {
            var primaryRange = this.stateModel.get("primaryRange");
            if(primaryRange)
            {
                this._gotoOffset(primaryRange.get("begin"));
            }
            else
            {
                this._gotoOffset(offset);
            }
        },

        _gotoOffset: function(offset)
        {
            if(_.isFinite(offset))
            {
                var index = this.sampleData.indexOf("time", offset);
                this.grid.scrollRowToTop(index);
            }
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
