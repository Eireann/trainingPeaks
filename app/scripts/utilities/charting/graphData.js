define(
[
    "underscore",
    "utilities/charting/dataParserUtils",
    "utilities/charting/flotUtils",
    "utilities/sampleData"
],
function(_, DataParserUtils, FlotUtils, SampleData)
{
    var defaultChannelOrder =
    [
        "Elevation",
        "Cadence",
        "HeartRate",
        "Power",
        "RightPower",
        "Speed",
        "Pace",
        "Torque",
        "Temperature"
    ];


    var GraphData = function(options)
    {
        this.detailData = options.detailData;
        this.xaxis = "time";
        this.disabledSeries = [];
        this.excludedSeries = [];
        this.excludedRanges = [];
        this.flatSamples = null;
        this.xAxisDistanceValues = [];
        this.dataByAxisAndChannel = null;
        this.latLonArray = null;
        this.averageStats = {};

        this.sampleData = new SampleData([]);
    };

    _.extend(GraphData, {defaultChannelOrder: defaultChannelOrder});

    GraphData.prototype =
    {
        loadData: function(flatSamples)
        {
            this.flatSamples = flatSamples;
            this.reset();
        },

        reset: function()
        {
            this.sampleData = new SampleData(this.flatSamples && _.clone(this.flatSamples.channels, true) || []);
            this.hasLatLongData = this.flatSamples && this.flatSamples.hasLatLngData;
        },

        setDisabledSeries: function(series)
        {
            this.disabledSeries = series;
        },

        getSeries: function(x1, x2)
        {
            return this._generateSeriesFromData(this.xaxis);
        },

        getSeriesForAxes: function(xaxis, yaxis)
        {
            var data = [];

            data = this.sampleData.getChannels(xaxis, yaxis).toArray();

            var seriesData = FlotUtils.seriesOptions(data, yaxis, { minElevation: this.getMinimumForAxis("Elevation") });

            this._setAverageStats(xaxis, yaxis);

            return [seriesData];
        },

        _setAverageStats: function(xaxis, yaxis)
        {
            var self = this;
            var totalStats = this.detailData.get("totalStats");
            var average = function(axis)
            {
                switch(axis)
                {
                    case "Cadence":
                        return totalStats.averageCadence;
                    case "Elevation":
                        return totalStats.averageElevation;
                    case "HeartRate":
                        return totalStats.averageHeartRate;
                    case "Power":
                        return totalStats.averagePower;
                    case "Speed":
                        return totalStats.averageSpeed;
                    case "Temperature":
                        return totalStats.averageTemp;
                    case "Torque":
                        return totalStats.averageTorque;
                    case "PowerBalance":
                        return totalStats.powerBalanceRight;
                    case "Distance":
                    case "Time":
                        var total = 0;
                        var sum = 0;
                        
                        self.sampleData.getChannel(axis).each(function(value)
                        {
                            if(_.isFinite(value))
                            {
                                total++;
                                sum += value;
                            }
                        });

                        return sum / total;
                    default:
                        return null;
                }
            };

            var avgData = average(xaxis);
            this.averageStats[xaxis + yaxis] = {};

            if(avgData) this.averageStats[xaxis + yaxis].xaxis = avgData;

            if(xaxis === yaxis)
            {
                this.averageStats[xaxis + yaxis].yaxis = avgData;
            }
            else
            {
                avgData = average(yaxis);
                if(avgData) this.averageStats[xaxis + yaxis].yaxis = avgData;
            }
        },

        resetLatLonArray: function()
        {
            this.latLonArray = null;
        },

        getYAxes: function(series)
        {
            return FlotUtils.generateYAxes(series, this.workoutTypeValueId, this);
        },

        getMinimumForAxis: function(series, x1, x2)
        {
            var channel = this.sampleData.sliceBy("time", x1 || 0, x2).getChannel(series);
            var minimum = channel ? channel.select(_.isNumber).min() : null;

            if(series.toLowerCase() === "elevation")
            {
                return minimum;
            }
            else if(series.toLowerCase() === "temperature")
            {
                return Math.min(minimum, 0);
            }
            else
            {
                return 0;
            }
        },

        getLatLonArray: function()
        {
            this.latLonArray = this.latLonArray || this._generateLatLonFromData();
            return this.latLonArray;
        },

        createCorrectedElevationChannel: function (elevations)
        {
            return this.sampleData.getChannel("distance").zip(elevations).toArray();
        },

        getLatLonFromMsOffset: function (offset)
        {
            var index = this.sampleData.indexOf("time", offset);
            return this.getLatLongByIndex(index);
        },

        getLatLongByIndex: function(index)
        {
            var lat = this.sampleData.get("latitude", index);
            var lng = this.sampleData.get("longitude", index);

            if (lat !== null && lng !== null && !_.isNaN(lat) && !_.isNaN(lng))
                return { lat: lat, lng: lng };
            else
                return null;
        },

        getDataByAxisAndChannel: function (axis, channel)
        {
            return this.sampleData.getChannels(axis, channel).toArray();
        },

        setXAxis: function (xaxis)
        {
            if (xaxis !== "time" && xaxis !== "distance")
                throw new Error("DataParser: xaxis value " + xaxis + " is invalid");

            this.xaxis = xaxis;
        },

        getMsOffsetFromDistance: function (distance)
        {
            var index = this.sampleData.indexOf("distance", distance);
            return this.sampleData.get("time", index);
        },

        getMsOffsetOfLastSample: function()
        {
            return this.sampleData.getChannel("time").last();
        },

        getDistanceFromMsOffset: function (msOffset)
        {
            var index = this.sampleData.indexOf("time", msOffset);
            return this.sampleData.get("distance", index);
        },

        excludeRange: function(channel, beginMsOffset, endMsOffset)
        {
            this.sampleData.sliceBy("time", beginMsOffset, endMsOffset).deleteValues(channel);
        },

        excludeChannel: function(channel)
        {
            this.sampleData.deleteChannel(channel);
        },

        resetExcludedRanges: function()
        {
            this.reset();
        },

        getAvailableChannels: function()
        {
            return _.difference(this.sampleData.listChannels(), this.excludedSeries);
        },

        _generateSeriesFromData: function(xaxis)
        {
            var seriesArray = [];

            _.each(this.sampleData.listChannels(), function(channel)
            {
                if(_.contains(this.disabledSeries, channel)) return;
                if(_.include(["time", "distance", "longitude", "latitude"], channel)) return;

                var data = this.sampleData.getChannels(xaxis, channel).toArray();

                var seriesOptions = FlotUtils.seriesOptions(data, this.sampleData.getChannelData(channel).name, { minElevation: this.getMinimumForAxis("Elevation") });

                seriesArray.push(seriesOptions);
            }, this);

            var orderedSeriesArray = [];

            _.each(GraphData.defaultChannelOrder, function(orderedChannel)
            {
                var series = DataParserUtils.findChannelInSeriesArray(seriesArray, orderedChannel);

                if (series)
                {
                    orderedSeriesArray.push(series);
                }
            });

            return orderedSeriesArray;
        },

        _generateLatLonFromData: function()
        {
            return this._generateLatLonFromDataBetweenIndexes(0, undefined);
        },

        _generateLatLonFromDataBetweenIndexes: function(startIndex, endIndex)
        {
            var data = this.sampleData.slice(startIndex, endIndex);
            var array = data.getChannels("latitude", "longitude").reject(function(latLon)
            {
                return _.any(latLon, _.isNaN) || !_.all(latLon, _.isNumber);
            }).toArray();

            return array.length ? array : null;
        },

        getLatLonBetweenMsOffsets: function(startMsOffset, endMsOffset)
        {
            return this._generateLatLonFromDataBetweenIndexes(this.sampleData.indexOf("time", startMsOffset), this.sampleData.indexOf("time", endMsOffset));
        }

    };
    return GraphData;
});
