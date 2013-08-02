define(
[
    "utilities/charting/chartColors",
    "utilities/charting/findIndexByMsOffset",
    "utilities/conversion/convertToViewUnits"
],
function(chartColors, findIndexByMsOffset, convertToViewUnits)
{
    var flexChannelOrder =
    [
        "Cadence",
        "HeartRate",
        "Elevation",
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
            return findIndexByMsOffset(this.xAxisDistanceValues, xAxisOffset);

        return findIndexByMsOffset(this.flatSamples.msOffsetsOfSamples, xAxisOffset);
    };

    var parseDataByAxisAndChannel = function(flatSamples)
    {
        var dataByAxisAndChannel =
        {
            time: {},
            distance: {}
        };

        var previousElevation = null;
        var distanceChannelIdx = _.indexOf(flatSamples.channelMask, "Distance");
        var xAxisZeroAlreadySet = false;

        if (!flatSamples || !flatSamples.samples)
            return null;

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

    var generateSeriesFromData = function(channelMask, dataByChannel, elevationIsAllNegative, x1, x2)
    {
        var self = this;
        var seriesArray = [];

        _.each(channelMask, function(channel)
        {
            if (_.contains(self.disabledSeries, channel))
                return;
            
            if (channel === "Distance")
                return;

            if (channel === "Latitude" || channel === "Longitude")
                return;

            if (channel === "Elevation" && elevationIsAllNegative)
                return;

            var fillOpacity = channel === "Elevation" ? 0.3 : null;

            var data = [];
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
            {
                var startIdx = findIndexByXAxisOffset.call(self, x1);
                var endIdx = findIndexByXAxisOffset.call(self, x2);
                
                for (var idx = startIdx; idx <= endIdx; idx++)
                    data.push(dataByChannel[channel][idx]);
            }
            else
                data = _.clone(dataByChannel[channel]);

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
            }

            seriesArray.push(seriesOptions);
        });

        var orderedSeriesArray = [];

        _.each(flexChannelOrder, function(orderedChannel)
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
        }

        return latLon;
    };

    var generateYAxes = function(series)
    {
        var self = this;
        var yaxes = [];
        var countdown = (series.length / 2).toFixed(0);
        var axisIndex = 1;

        _.each(series, function(s)
        {
            if (s.label === "Pace")
                return;
            
            s.yaxis = axisIndex++;
            var axisOptions =
            {
                show: true,
                label: s.label,
                min: s.label === "Elevation" ? self.getElevationInfo().min : 0,
                position: countdown-- > 0 ? "right" : "left",
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
                    return value === 0 ? +0 : parseInt(convertToViewUnits(value, s.label.toLowerCase()), 10);
                },
                labelWidth: 15
            };

            yaxes.push(axisOptions);
        });
        return yaxes;
    };
    
    var DataParser = function ()
    {
        this.xaxis = "time";
        this.disabledSeries = [];
        this.flatSamples = null;
        this.xAxisDistanceValues = [];
        this.dataByChannel = null;
        this.minElevation = null;
        this.elevationIsAllNegative = null;
        this.latLonArray = null;
        this._channelMask = [];
    };

    _.extend(DataParser.prototype,
    {
        loadData:  function(flatSamples)
        {
            this.flatSamples = flatSamples;
            this.dataByAxisAndChannel = parseDataByAxisAndChannel.call(this, flatSamples);

            // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
            var elevationInfo = getElevationInfoOnRange.call(this, this.dataByAxisAndChannel[this.xaxis]);
            this.minElevation = elevationInfo.min;
            this.elevationIsAllNegative = elevationInfo.isAllNegative;

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
            return generateSeriesFromData.call(this, this.flatSamples.channelMask, this.dataByAxisAndChannel[this.xaxis], this.elevationIsAllNegative, x1, x2);
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

        getLatLonArray: function()
        {
            if (this.dataByAxisAndChannel[this.xaxis].Latitude && this.dataByAxisAndChannel[this.xaxis].Longitude && !this.latLonArray)
                this.latLonArray = generateLatLonFromData.call(this, this.dataByAxisAndChannel[this.xaxis]);

            return this.latLonArray;
        },

        getLatLonBetweenMsOffsets: function(startMsOffset, endMsOffset)
        {
            var sampleStartIndex = findIndexByXAxisOffset.call(this, startMsOffset);
            var sampleEndIndex = findIndexByXAxisOffset.call(this, endMsOffset);

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
            var badIndeces = [];
            
            for (var i = 0; i < this.dataByAxisAndChannel[this.xaxis]["Latitude"].length; i++)
            {
                if (_.isNaN(this.dataByAxisAndChannel[this.xaxis]["Latitude"][i][1]) || _.isNaN(this.dataByAxisAndChannel[this.xaxis]["Longitude"][i][1]))
                    badIndeces.push(i);
            }

            _.each(badIndeces, function(badIndex)
            {
                if (badIndex === 0)
                    elevations.unshift(null);
                else
                    elevations.splice(badIndex, 0, null);
            });

            var corrected = _.map(this.dataByAxisAndChannel[this.xaxis]["Elevation"], function (elevationPoint)
            {
                if (index >= (elevations.length - 1))
                    return [elevationPoint[0], null];

                return [elevationPoint[0], elevations[index++]];
            });
            return corrected;
        },
        
        getLatLongFromOffset: function (xAxisOffset)
        {
            var index = findIndexByXAxisOffset.call(this, xAxisOffset);

            if (index === null)
                return null;

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
                throw "DataParser: xaxis value " + xaxis + " is invalid";

            this.xaxis = xaxis;
        },
        
        getMsOffsetFromDistance: function (distance)
        {
            var index = findIndexByXAxisOffset.call(this, distance);

            if(index !== null && index < this.flatSamples.msOffsetsOfSamples.length)
                return this.flatSamples.msOffsetsOfSamples[index];

            return null;
        }

    });
    
    return DataParser;
});