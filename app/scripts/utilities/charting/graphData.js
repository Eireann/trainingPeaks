define(
[
    "underscore",
    "utilities/charting/dataParserUtils",
    "utilities/charting/findOrderedArrayIndexByValue",
    "utilities/charting/flotUtils"
],
function(_, DataParserUtils, findOrderedArrayIndexByValue, FlotUtils)
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
        this.elevationInfo = {};
        this.minTemperature = null;
        this.latLonArray = null;
        this.averageStats = {};
    };

    _.extend(GraphData, {defaultChannelOrder: defaultChannelOrder});

    GraphData.prototype =
    {
        setDisabledSeries: function(series)
        {
            this.disabledSeries = series;
        },

        getSeries: function(x1, x2)
        {
            return this.generateSeriesFromData(this.flatSamples, this.dataByAxisAndChannel[this.xaxis], this.elevationInfo.min, this.xaxis, this.xAxisDistanceValues, this.disabledSeries, this.excludedSeries, this.excludedRanges, x1, x2);
        },

        getSeriesForAxes: function(xaxis, yaxis)
        {
            var data = [];
            var channel = "time";

            data = _.clone(this.dataByAxisAndChannel[channel]);

            // remove cut ranges
            this.removeExcludedRangesFromData(data, this.excludedRanges, channel, "time", this.flatSamples.msOffsetsOfSamples);

            var seriesData = FlotUtils.seriesOptions(data[yaxis], yaxis, { minElevation: this.elevationInfo.min });

            var newSeries = this.processData(data, xaxis, yaxis);
            seriesData.data = newSeries;

            return [seriesData];
        },

        processData: function(data, xaxis, yaxis)
        {
            var newSeries = [];
            var ecks;
            var why;
            var totalPowerValue;
            var rightPowerValue;
            var rightPowerPercentage;
            var balancedPowerAvailable = _.has(data, "RightPower");

            var powerPercentage = function(index)
            {
                totalPowerValue = data["Power"][index][1];
                rightPowerValue = data["RightPower"][index][1];

                rightPowerPercentage = (100 * rightPowerValue / totalPowerValue);

                return rightPowerPercentage;
            }

            _.each(data[xaxis], function(dataPoint, index)
            {
                ecks = data[xaxis][index][1];
                why = data[yaxis][index][1];
                if(xaxis === "RightPower")
                {
                    ecks = powerPercentage(index);
                }

                if(yaxis === "RightPower")
                {
                    why = powerPercentage(index);
                }
                // This is a hack to prevent errant data from skewing graphs.
                if(balancedPowerAvailable && (xaxis === "RightPower" || yaxis === "RightPower"))
                {
                    if(totalPowerValue < rightPowerValue)
                    {
                        data["Power"][index][1] = data["RightPower"][index][1] = null;
                        ecks = why = null;
                    }
                }

                newSeries.push([ecks, why]);
            }, this);

            this.setAverageStats(data, xaxis, yaxis);

            return newSeries;
        },

        setAverageStats: function(data, xaxis, yaxis)
        {
            var totalStats = this.detailData.get("totalStats");
            var average = function(data, axis)
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
                    case "RightPower":
                        return totalStats.powerBalanceRight * 100;
                    case "Distance":
                    case "Time":
                        var total = 0;
                        var sum = _.reduce(data[axis], function(sum, num) {
                            if(_.isFinite(num[1]))
                            {
                                total++;
                                return sum + num[1];
                            }
                            return sum;
                        }, 0);
                        return sum / total;
                    default:
                        return null;
                }
            }

            var avgData = average(data, xaxis);
            this.averageStats[xaxis + yaxis] = {};

            if(avgData) this.averageStats[xaxis + yaxis].xaxis = avgData;

            if(xaxis === yaxis)
            {
                this.averageStats[xaxis + yaxis].yaxis = avgData;
            }
            else
            {
                avgData = average(data, yaxis);
                if(avgData) this.averageStats[xaxis + yaxis].yaxis = avgData;
            }
        },

        resetLatLonArray: function()
        {
            this.latLonArray = null;
        },

        getYAxes: function(series)
        {
            return FlotUtils.generateYAxes(series, this.workoutTypeValueId, this.dataByAxisAndChannel[this.xaxis], this.elevationInfo, this);
        },

        getMinimumForAxis: function(series, data, elevationInfo, x1, x2)
        {
            switch(series)
            {
                case "Elevation":
                    return DataParserUtils.getElevationInfo(data, elevationInfo, x1, x2, this.flatSamples.msOffsetsOfSamples).min;

                case "Temperature":
                    return DataParserUtils.getTemperatureMinimum(data, this.minTemperature, x1, x2, this.flatSamples.msOffsetsOfSamples);

                default:
                    return 0;
            }
        },

        getLatLonArray: function()
        {
            if (this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude && !this.latLonArray)
                this.latLonArray = this.generateLatLonFromData(this.dataByAxisAndChannel[this.xaxis]);

            return this.latLonArray;
        },

        createCorrectedElevationChannel: function (elevations)
        {
            // elevation correction view always uses distance, whether main graph is in distance or time
            var index = 0;
            var corrected = _.map(this.dataByAxisAndChannel["distance"]["Elevation"], function (elevationPoint)
            {
                if (index >= (elevations.length - 1))
                    return [elevationPoint[0], null];

                return [elevationPoint[0], elevations[index++] / 100];
            });
            return corrected;
        },

        getLatLongFromOffset: function (xAxisOffset)
        {
            // original call: findIndexByXAxisOffset
            var index = DataParserUtils.findIndexByChannelAndOffset(this.xAxisDistanceValues, this.xaxis, xAxisOffset, this.flatSamples.msOffsetsOfSamples);

            if (index === null)
                return null;

            return this.getLatLongByIndex(index);
        },

        getLatLongByIndex: function(index)
        {
            var lat = this.dataByAxisAndChannel[this.xaxis].Latitude[index][1];
            var lng = this.dataByAxisAndChannel[this.xaxis].Longitude[index][1];

            if (lat !== null && lng !== null && !_.isNaN(lat) && !_.isNaN(lng))
                return { lat: lat, lng: lng };
            else
                return null;
        },

        getDataByAxisAndChannel: function (axis, channel)
        {
            if (_.has(this.dataByAxisAndChannel[axis], channel))
                return this.dataByAxisAndChannel[axis][channel];
            else
                return null;
        },

        setXAxis: function (xaxis)
        {
            if (xaxis !== "time" && xaxis !== "distance")
                throw new Error("DataParser: xaxis value " + xaxis + " is invalid");

            this.xaxis = xaxis;
        },

        getMsOffsetFromDistance: function (distance)
        {
            var index = DataParserUtils.findIndexByChannelAndOffset(this.xAxisDistanceValues, "distance", distance, this.flatSamples.msOffsetsOfSamples);

            if(index !== null && index < this.flatSamples.msOffsetsOfSamples.length)
                return this.flatSamples.msOffsetsOfSamples[index];

            return null;
        },

        getDistanceFromMsOffset: function (msOffset)
        {
            var index = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, msOffset);
            if (index !== null && index < this.getDataByAxisAndChannel("distance", "Distance").length)
                return this.getDataByAxisAndChannel("distance", "Distance")[index][1];
            return null;
        },

        excludeRange: function(channel, beginMsOffset, endMsOffset)
        {
            var beginIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, beginMsOffset);
            var endIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, endMsOffset);

            this.excludedRanges.push({
                channel: channel,
                time: {
                    begin: beginMsOffset,
                    end: endMsOffset
                },
                distance: {
                    begin: this.xAxisDistanceValues[beginIndex],
                    end: this.xAxisDistanceValues[endIndex]
                }

            });
        },

        excludeChannel: function(channel)
        {
            if(!_.contains(this.excludedSeries, channel))
            {
                this.excludedSeries.push(channel);
            }
        },

        resetExcludedRanges: function()
        {
            this.excludedSeries = [];
            this.excludedRanges = [];
        },

        getAvailableChannels: function()
        {
            return _.difference(this.flatSamples.channelMask, this.excludedSeries);
        },

        removeExcludedRangesFromData: function(data, excludedRanges, channel, offsetType, offsetsOfSamples)
        {
            if(!excludedRanges || !excludedRanges.length)
            {
                return;
            }
            _.each(excludedRanges, function(range)
            {
                if(range.channel === channel || range.channel === "AllChannels")
                {

                    // offset by one on each end seems to be closer to the result that is returned after applying cuts
                    var rangeStartIndex = findOrderedArrayIndexByValue(offsetsOfSamples, range[offsetType].begin) + 1;
                    var rangeEndIndex = findOrderedArrayIndexByValue(offsetsOfSamples, range[offsetType].end) - 1;

                    if(rangeStartIndex >= 0 && rangeEndIndex >= 0)
                    {
                        var getPointValue = function() {return null;};


                        // extrapolate values for distance view
                        if(offsetType === "distance")
                        {
                            var beginValue = data[rangeStartIndex][1];
                            var endValue = data[rangeEndIndex][1];
                            var increment = (endValue - beginValue) / (rangeEndIndex - rangeStartIndex);
                            var currentValue = beginValue;
                            getPointValue = function()
                            {
                                currentValue += increment;
                                return currentValue;
                            };
                        }
                        else
                        {
                            // delete values for time view, except flatten elevation
                            if(channel === "Elevation" && rangeStartIndex > 0)
                            {
                                var previousElevation = data[rangeStartIndex][1];
                                getPointValue = function(){return previousElevation;};
                            }
                        }

                        for(var i = rangeStartIndex;i<=rangeEndIndex && i < data.length;i++)
                        {
                            // if xaxis is distance, extrapolate, otherwise just cut

                            // each data point is an array with index and value - remove the value but leave the index intact
                            data[i][1] = getPointValue();
                        }
                    }
                }
            });
        },

        generateSeriesFromData: function(flatSamples, dataByChannel, minElevation, xaxis, xAxisDistanceValues, disabledSeries, excludedSeries, excludedRanges, x1, x2)
        {
            var seriesArray = [];

            var offsetsOfSamples = xaxis === "distance" ? xAxisDistanceValues : flatSamples.msOffsetsOfSamples;
            var startIdx, endIdx;
            if(!_.isUndefined(x1) && !_.isUndefined(x2))
            {
                startIdx = DataParserUtils.findIndexByChannelAndOffset(dataByChannel, xaxis, x1, flatSamples.msOffsetsOfSamples);
                endIdx = DataParserUtils.findIndexByChannelAndOffset(dataByChannel, xaxis, x2, flatSamples.msOffsetsOfSamples);
                offsetsOfSamples = offsetsOfSamples.slice(startIdx, endIdx + 1);
            }

            _.each(flatSamples.channelMask, function(channel)
            {
                if (_.contains(disabledSeries, channel))
                    return;

                if(_.contains(excludedSeries, channel))
                    return;

                if (channel === "Distance")
                    return;

                if (channel === "Latitude" || channel === "Longitude")
                    return;

                var data = [];
                if(!_.isUndefined(x1) && !_.isUndefined(x2))
                {
                    data = dataByChannel[channel].slice(startIdx, endIdx + 1);
                }
                else
                {
                    data = _.clone(dataByChannel[channel]);
                }

                // remove cut ranges
                this.removeExcludedRangesFromData(data, excludedRanges, channel, xaxis, offsetsOfSamples);

                var seriesOptions = FlotUtils.seriesOptions(data, channel, { minElevation: minElevation });

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

        generateLatLonFromData: function(dataByChannel)
        {
            var startIndex = 0;
            var endIndex = dataByChannel.Latitude.length;
            return this.generateLatLonFromDataBetweenIndexes(dataByChannel, startIndex, endIndex);
        },

        generateLatLonFromDataBetweenIndexes: function(dataByChannel, startIndex, endIndex)
        {
            var latLon = [];

            if (_.has(dataByChannel, "Latitude") && _.has(dataByChannel, "Longitude") && (dataByChannel.Latitude.length === dataByChannel.Longitude.length))
            {
                for (var i = startIndex; i < endIndex; i++)
                {
                    var lat = dataByChannel.Latitude[i][1];
                    var lon = dataByChannel.Longitude[i][1];

                    if (_.isNaN(lat) || _.isNaN(lon))
                        continue;

                    latLon.push([lat, lon]);
                }
            }

            return latLon;
        },

        getLatLonBetweenMsOffsets: function(dataByAxisAndChannel, startMsOffset, endMsOffset)
        {
            if(!this.hasLatLongData) return [];

            var sampleStartIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, startMsOffset);
            var sampleEndIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, endMsOffset);

            return this.generateLatLonFromDataBetweenIndexes(dataByAxisAndChannel, sampleStartIndex, sampleEndIndex);
        }

    };
    return GraphData;
});
