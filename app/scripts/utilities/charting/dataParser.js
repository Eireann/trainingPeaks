define(
[
    "utilities/charting/chartColors",
    "utilities/charting/findOrderedArrayIndexByValue",
    "utilities/conversion/conversion"
],
function(chartColors, findOrderedArrayIndexByValue, conversion)
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

    var findIndexByXAxisOffset = function (xAxisOffset)
    {
        if (this.xaxis === "distance")
            return findOrderedArrayIndexByValue(this.xAxisDistanceValues, xAxisOffset);

        return findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, xAxisOffset);
    };

    var findDistanceByMsOffset = function(msOffset)
    {
        var sampleIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, msOffset);
        return this.xAxisDistanceValues[sampleIndex];
    };

    var parseDataByAxisAndChannel = function(flatSamples)
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

                    this._channelMask.push(channelName);
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
                        this.xAxisDistanceValues.push(xAxisDistanceOffset);
                }
                
                if (xAxisDistanceOffset === 0)
                    xAxisZeroAlreadySet = true;
            }
        }

        return dataByAxisAndChannel;
    };

    var removeExcludedRangesFromGraphData = function(data, excludedRanges, channel, offsetType, offsetsOfSamples)
    {
        if(!excludedRanges || !excludedRanges.length)
        {
            return data;
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

        return data;
    };

    var removeExcludedRangesFromLatLonData = function(data, excludedRanges, msOffsetsOfSamples)
    {
        if(!excludedRanges || !excludedRanges.length || !data || !data.length)
        {
            return data;
        }     
        _.each(excludedRanges, function(range)
        {
            if(_.contains(["Latitude", "Longitude", "AllChannels"], range.channel))
            {
                var rangeStartIndex = findOrderedArrayIndexByValue(msOffsetsOfSamples, range.time.begin);
                var rangeEndIndex = findOrderedArrayIndexByValue(msOffsetsOfSamples, range.time.end);

                if(rangeStartIndex >= 0 && rangeEndIndex >= 0)
                {
                    data.splice(rangeStartIndex, (rangeEndIndex - rangeStartIndex));
                }
            }
        });

        return data;
    };

    var generateSeriesFromData = function(channelMask, dataByChannel, minElevation, x1, x2)
    {
        var self = this;
        var seriesArray = [];

        var offsetsOfSamples = this.xaxis === "distance" ? this.xAxisDistanceValues : this.flatSamples.msOffsetsOfSamples;
        var startIdx, endIdx;
        if(!_.isUndefined(x1) && !_.isUndefined(x2))
        {
            startIdx = findIndexByXAxisOffset.call(self, x1);
            endIdx = findIndexByXAxisOffset.call(self, x2);
            offsetsOfSamples = offsetsOfSamples.slice(startIdx, endIdx + 1);
        }

        _.each(channelMask, function(channel)
        {
            if (_.contains(self.disabledSeries, channel))
                return;

            if(_.contains(self.excludedSeries, channel))
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
            data = removeExcludedRangesFromGraphData(data, self.excludedRanges, channel, self.xaxis, offsetsOfSamples);

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

            // right power should be dashed
            if(channel === "RightPower")
            {
                seriesOptions.lines = {
                    show: false
                };
                seriesOptions.dashes = {
                    show: true,
                    lineWidth: 1
                };
            }

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

        _.each(defaultChannelOrder, function(orderedChannel)
        {
            var series = findChannelInSeriesArray(seriesArray, orderedChannel);

            if (series)
            {
                orderedSeriesArray.push(series);
            }
        });

        return orderedSeriesArray;
    };

    var findChannelInSeriesArray = function(seriesArray, channelName)
    {
        return _.find(seriesArray, function(s) { return s.label === channelName; });
    };

    var getElevationInfoOnRange = function(dataByChannel, x1, x2)
    {
        var elevationIsAllNegative = true;
        var minElevation = 10000;
        
        if (_.has(dataByChannel, "Elevation"))
        {
            var startIdx = 0;
            var endIdx = dataByChannel["Elevation"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
            {
                startIdx = findIndexByXAxisOffset.call(this, x1);
                endIdx = findIndexByXAxisOffset.call(this, x2);
            }

            for(startIdx; startIdx <= endIdx; startIdx++)
            {
                var value = dataByChannel["Elevation"][startIdx][1];
                elevationIsAllNegative = elevationIsAllNegative && (value === null ? true : value < 0);
                value = value === null ? 999999999999999 : value;
                if (value < minElevation)
                    minElevation = value;
            }
        }

        return {
            min: minElevation,
            isAllNegative: elevationIsAllNegative
        };
    };

    var getTemperatureMinimumOnRange = function(dataByChannel, x1, x2)
    {
        var minTemperature = 0;
        
        if (_.has(dataByChannel, "Temperature"))
        {
            var startIdx = 0;
            var endIdx = dataByChannel["Temperature"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
            {
                startIdx = findIndexByXAxisOffset.call(this, x1);
                endIdx = findIndexByXAxisOffset.call(this, x2);
            }

            for(startIdx; startIdx <= endIdx; startIdx++)
            {
                var value = dataByChannel["Temperature"][startIdx][1];
                if (value !== null && value < minTemperature)
                    minTemperature = value;
            }
        }

        return minTemperature;
    };

    var generateLatLonFromData = function(dataByChannel)
    {
        var startIndex = 0;
        var endIndex = dataByChannel.Latitude.length;
        return generateLatLonFromDataBetweenIndexes.call(this, dataByChannel, startIndex, endIndex);
    };

    var generateLatLonFromDataBetweenIndexes = function(dataByChannel, startIndex, endIndex)
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

            latLon = removeExcludedRangesFromLatLonData(latLon, this.excludedRanges, this.flatSamples.msOffsetsOfSamples.slice(startIndex, endIndex + 1));
        }

        return latLon;
    };

    var generateYAxes = function(series)
    {
        var self = this;
        var yaxes = [];
        var axisIndex = 1;

        var hasRightPower = findChannelInSeriesArray(series, "RightPower") ? true : false;

        _.each(series, function(s)
        {
            var showSpeedAsPace = s.label === "Speed" && _.contains([1,3,12,13], self.workoutTypeValueId);
            if (s.label === "Pace")
                return;
            
            s.yaxis = axisIndex;
            if(s.label !== "Power" || !hasRightPower) // if we have both power and right power, they should share the same y axis 
            {
                axisIndex++;
            }

            var axisOptions =
            {
                show: true,
                label: s.label,
                min: self.getMinimumForYAxis(s.label),
                color: "transparent",
                tickColor: "transparent",
                font:
                {
                    color: chartColors.seriesColorByChannel[s.label]
                },
                tickFormatter: function(value)
                {
                    // Purposefully using the closure created above to capture s.label for each given axis,
                    // in order to easily obtain the correct unit conversion for each axis.
                    // For some reason, a '0' value returns a NaN, check for it.

                    // Swim workouts need to format "Speed" as "Pace"
                    if (showSpeedAsPace)
                    {
                        return value === 0 ? +0 : conversion.formatUnitsValue("pace", value, { defaultValue: null, workoutTypeId: self.workoutTypeValueId } );
                    }
                    return value === 0 && s.label !== "Temperature" ? +0 : parseInt(conversion.formatUnitsValue(s.label.toLowerCase(), value, {workoutTypeValueId: self.workoutTypeValueId}), 10);
                },
                labelWidth: showSpeedAsPace ? 27 : 15
            };

            yaxes.push(axisOptions);
        });

        // right power should share index with power if present
        var rightPowerAxis = findChannelInSeriesArray(yaxes, "RightPower");
        var powerAxis = findChannelInSeriesArray(yaxes, "Power");
        if(rightPowerAxis && powerAxis)
        {
            yaxes = _.without(yaxes, rightPowerAxis);
        }

        // distribute them on right first then left
        _.each(yaxes, function(axis, index)
        {
            if(index < (yaxes.length / 2))
            {
                axis.position = "right";
            }
            else
            {
                axis.position = "left";
            }
        });

        return yaxes;
    };
    
    var DataParser = function ()
    {
        this.xaxis = "time";
        this.disabledSeries = [];
        this.excludedSeries = [];
        this.excludedRanges = [];
        this.flatSamples = null;
        this.xAxisDistanceValues = [];
        this.dataByAxisAndChannel = null;
        this.minElevation = null;
        this.minTemperature = null;
        this.elevationIsAllNegative = null;
        this.latLonArray = null;
        this._channelMask = [];
    };

    _.extend(DataParser.prototype,
    {
        loadData:  function(flatSamples)
        {
            // Re-initialize so array's don't double in length
            this.xAxisDistanceValues = [];

            this.flatSamples = flatSamples;
            this.dataByAxisAndChannel = parseDataByAxisAndChannel.call(this, flatSamples);

            // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
            var elevationInfo = getElevationInfoOnRange.call(this, this.dataByAxisAndChannel[this.xaxis]);
            this.minElevation = elevationInfo.min;
            this.elevationIsAllNegative = elevationInfo.isAllNegative;

            this.minTemperature = getTemperatureMinimumOnRange.call(this, this.dataByAxisAndChannel[this.xaxis]);

            if (this.dataByAxisAndChannel && this.dataByAxisAndChannel[this.xaxis] && this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude)
                this.hasLatLongData = true;
            else
                this.hasLatLongData = false;

            this.latLonArray = null;
        },

        setDisabledSeries: function(series)
        {
            this.disabledSeries = series;
        },

        getSeries: function(x1, x2)
        {
            return generateSeriesFromData.call(this, this.flatSamples.channelMask, this.dataByAxisAndChannel[this.xaxis], this.minElevation, x1, x2);
        },

        getElevationInfo: function(x1, x2)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return getElevationInfoOnRange.call(this, this.dataByAxisAndChannel[this.xaxis], x1, x2);

            return {
                min: this.minElevation,
                isAllNegative: this.elevationIsAllNegative
            };
        },

        getTemperatureMinimum: function(x1, x2)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return getTemperatureMinimumOnRange.call(this, this.dataByAxisAndChannel[this.xaxis], x1, x2);

            return this.minTemperature;
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

        resetLatLonArray: function()
        {
            this.latLonArray = null;
        },

        getLatLonArray: function()
        {
            if (this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude && !this.latLonArray)
                this.latLonArray = generateLatLonFromData.call(this, this.dataByAxisAndChannel[this.xaxis]);

            return this.latLonArray;
        },

        getLatLonBetweenMsOffsets: function(startMsOffset, endMsOffset)
        {
            if(!this.hasLatLongData) return [];

            var sampleStartIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, startMsOffset);
            var sampleEndIndex = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, endMsOffset);

            return generateLatLonFromDataBetweenIndexes.call(this, this.dataByAxisAndChannel[this.xaxis], sampleStartIndex, sampleEndIndex);
        },

        getYAxes: function(series)
        {
            return generateYAxes.call(this, series);
        },
        
        getChannelMask: function()
        {
            return this._channelMask;
        },
        
        createCorrectedElevationChannel: function (elevations)
        {
            var index = 0;
            var corrected = _.map(this.dataByAxisAndChannel[this.xaxis]["Elevation"], function (elevationPoint)
            {
                if (index >= (elevations.length - 1))
                    return [elevationPoint[0], null];

                return [elevationPoint[0], elevations[index++] / 100];
            });
            return corrected;
        },
        
        getLatLongFromOffset: function (xAxisOffset)
        {
            var index = findIndexByXAxisOffset.call(this, xAxisOffset);

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
        
        getDataByChannel: function (channel)
        {
            if (_.has(this.dataByAxisAndChannel[this.xaxis], channel))
                return this.dataByAxisAndChannel[this.xaxis][channel];
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
            var index = findIndexByXAxisOffset.call(this, distance);

            if(index !== null && index < this.flatSamples.msOffsetsOfSamples.length)
                return this.flatSamples.msOffsetsOfSamples[index];

            return null;
        },
        
        getDistanceFromMsOffset: function (msOffset)
        {
            var index = findOrderedArrayIndexByValue(this.flatSamples.msOffsetsOfSamples, msOffset);
            if (index !== null && index < this.getDataByChannel("Distance").length)
                return this.getDataByChannel("Distance")[index][1];
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
        }

    });
    
    return DataParser;
});
