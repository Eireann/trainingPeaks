define(
[
    "utilities/charting/chartColors",
    "utilities/charting/dataParser",
    "utilities/charting/flotUtils"
],
function(chartColors, DataParser, FlotUtils)
{
    var GraphDataParser = DataParser;

    _.extend(GraphDataParser.prototype,
    {
        loadData:  function(flatSamples)
        {
            // Re-initialize so array's don't double in length
            this.xAxisDistanceValues = [];

            this.flatSamples = flatSamples;
            this.dataByAxisAndChannel = GraphDataParser.parseDataByAxisAndChannel(flatSamples, this._channelMask, this.xAxisDistanceValues);

            // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
            var elevationInfo = FlotUtils.getElevationInfoOnRange(this.dataByAxisAndChannel[this.xaxis]);
            this.minElevation = elevationInfo.min;
            this.elevationIsAllNegative = elevationInfo.isAllNegative;

            this.minTemperature = FlotUtils.getTemperatureMinimumOnRange(this.dataByAxisAndChannel[this.xaxis]);

            if (this.dataByAxisAndChannel && this.dataByAxisAndChannel[this.xaxis] && this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude)
                this.hasLatLongData = true;
            else
                this.hasLatLongData = false;

            this.latLonArray = null;
        },

        getLatLonArray: function()
        {
            if (this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude && !this.latLonArray)
                this.latLonArray = GraphDataParser.generateLatLonFromData(this.dataByAxisAndChannel[this.xaxis]);

            return this.latLonArray;
        },

        getSeries: function(x1, x2)
        {
            return GraphDataParser.generateSeriesFromData(this.flatSamples, this.dataByAxisAndChannel[this.xaxis], this.minElevation, this.xaxis, this.xAxisDistanceValues, this.disabledSeries, this.excludedSeries, this.excludedRanges, x1, x2);
        },

        getYAxes: function(series)
        {
            return FlotUtils.generateYAxes(series, this.workoutTypeValueId, this.dataByAxisAndChannel[this.xaxis]);
        },

        getMinimumForYAxis: function(series)
        {
            switch(series)
            {

                case "Elevation":
                    return this.getElevationInfo().min;

                case "Temperature":
                    return this.getTemperatureMinimum();

                default:
                    return 0;
            }
        },

    });

    _.extend(GraphDataParser,
    {
        findIndexByXAxisOffset: function (xAxisOffset)
        {
            if (this.xaxis === "distance")
                return findOrderedArrayIndexByValue(this.xAxisDistanceValues, xAxisOffset);

            return findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, xAxisOffset);
        },

        findDistanceByMsOffset: function(msOffset)
        {
            var sampleIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, msOffset);
            return this.xAxisDistanceValues[sampleIndex];
        },

        parseDataByAxisAndChannel: function(flatSamples, channelMask, xAxisDistanceValues)
        {
            var dataByAxisAndChannel =
            {
                time: {},
                distance: {}
            };

            if (!flatSamples || !flatSamples.samples)
                return dataByAxisAndChannel;

            var previousElevation = null;
            var distanceChannelIdx = _.indexOf(flatSamples.channelMask, "Distance");
            var xAxisZeroAlreadySet = false;

            for (var sampleIdx = 0; sampleIdx < flatSamples.samples.length; sampleIdx++)
            {
                var sample = flatSamples.samples[sampleIdx];
                for (var channelIdx = 0; channelIdx < sample.values.length; channelIdx++)
                {
                    var channelName = flatSamples.channelMask[channelIdx];

                    if (!_.has(dataByAxisAndChannel.time, channelName))
                    {
                        dataByAxisAndChannel.time[channelName] = [];
                        dataByAxisAndChannel.distance[channelName] = [];

                        channelMask.push(channelName);
                    }

                    var value = sample.values[channelIdx];

                    if (value != null)
                    {
                        if (channelName === "Latitude" || channelName === "Longitude")
                            value = value / 100000;
                        else if (!(channelName === "Power" || channelName === "Cadence" || channelName === "HeartRate" || channelName === "RightPower"))
                            value = value / 100;
                    }

                    var xAxisTimeOffset = flatSamples.msOffsetsOfSamples[sampleIdx];

                    var xAxisDistanceOffset = null;
                    if (distanceChannelIdx !== -1)
                        xAxisDistanceOffset = sample.values[distanceChannelIdx] / 100;

                    if (channelName === "Elevation" && value === null)
                        value = previousElevation;
                    else if (channelName === "Elevation")
                        previousElevation = value;

                    dataByAxisAndChannel.time[channelName].push([xAxisTimeOffset, parseFloat(value)]);

                    if (xAxisDistanceOffset !== null && !(xAxisDistanceOffset === 0 && xAxisZeroAlreadySet))
                    {
                        dataByAxisAndChannel.distance[channelName].push([xAxisDistanceOffset, parseFloat(value)]);
                        if(channelName === "Distance")
                            xAxisDistanceValues.push(xAxisDistanceOffset);
                    }

                    if (xAxisDistanceOffset === 0)
                        xAxisZeroAlreadySet = true;
                }
            }

            return dataByAxisAndChannel;
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
                startIdx = GraphDataParser.findIndexByXAxisOffset(x1);
                endIdx = GraphDataParser.findIndexByXAxisOffset(x2);
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

                var fillOpacity = channel === "Elevation" ? 0.3 : null;

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
                GraphDataParser.removeExcludedRangesFromData(data, excludedRanges, channel, xaxis, offsetsOfSamples);

                var seriesOptions =
                {
                    color: chartColors.seriesColorByChannel[channel],
                    data: data,
                    label: channel,
                    lines:
                    {
                        fill: fillOpacity
                    },
                    shadowSize: 0
                };

                if (channel === "Elevation")
                {
                    seriesOptions.color = "#FFFFFF";
                    seriesOptions.lines.fillColor = { colors: [chartColors.gradients.elevation.dark, chartColors.gradients.elevation.light] };
                    _.each(data, function(dataPoint)
                    {
                        dataPoint.push(minElevation);
                    });
                }

                seriesArray.push(seriesOptions);
            });

            var orderedSeriesArray = [];

            _.each(GraphDataParser.defaultChannelOrder, function(orderedChannel)
            {
                var series = _.find(seriesArray, function (s) { return s.label === orderedChannel; });
                if (series)
                {
                    if (orderedChannel === "Elevation")
                        orderedSeriesArray.unshift(series);
                    else
                        orderedSeriesArray.push(series);
                }
            });

            return orderedSeriesArray;
        },


        generateLatLonFromData: function(dataByChannel)
        {
            var startIndex = 0;
            var endIndex = dataByChannel.Latitude.length;
            return GraphDataParser.generateLatLonFromDataBetweenIndexes.call(this, dataByChannel, startIndex, endIndex);
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


    });
    return GraphDataParser;
});

