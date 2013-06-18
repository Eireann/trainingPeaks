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

    var parseDataByChannel = function(flatSamples)
    {
        var dataByChannel = {};
        var previousElevation = null;

        if (!flatSamples || !flatSamples.samples)
        {
            return;
        }

        for (var sampleIdx = 0; sampleIdx < flatSamples.samples.length; sampleIdx++)
        {
            var sample = flatSamples.samples[sampleIdx];
            for (var channelIdx = 0; channelIdx < sample.values.length; channelIdx++)
            {
                var channelName = flatSamples.channelMask[channelIdx];

                if (!_.has(dataByChannel, channelName))
                {
                    dataByChannel[channelName] = [];
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

                if (channelName === "Elevation" && value === null)
                    value = previousElevation;
                else if (channelName === "Elevation")
                    previousElevation = value;

                dataByChannel[channelName].push([flatSamples.msOffsetsOfSamples[sampleIdx], parseFloat(value)]);
            }
        }

        return dataByChannel;
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
                var startIdx = findIndexByMsOffset(self.flatSamples.msOffsetsOfSamples, x1);
                var endIdx = findIndexByMsOffset(self.flatSamples.msOffsetsOfSamples, x2);
                
                for (var idx = startIdx; idx <= endIdx; idx++)
                    data.push(dataByChannel[channel][idx]);
            }
            else
                data = _.clone(dataByChannel[channel]);

            var seriesOptions = {
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
            var forceElevationFirst = true;
            var series = _.find(seriesArray, function (s) { return s.label === orderedChannel; });
            if (series)
            {
                if (forceElevationFirst && orderedChannel === "Elevation")
                {
                    orderedSeriesArray.unshift(series);
                } else
                {
                    orderedSeriesArray.push(series);
                }
            }
        });

        return orderedSeriesArray;
    };

    var getElevationInfoOnRange = function(x1, x2)
    {
        var elevationIsAllNegative = true;
        var minElevation = 10000;
        
        if (_.has(this.dataByChannel, "Elevation"))
        {
            var startIdx = 0;
            var endIdx = this.flatSamples.msOffsetsOfSamples.length - 1;
            
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
            {
                startIdx = findIndexByMsOffset(this.flatSamples.msOffsetsOfSamples, x1);
                endIdx = findIndexByMsOffset(this.flatSamples.msOffsetsOfSamples, x2);
            }

            for(startIdx; startIdx <= endIdx; startIdx++)
            {
                var value = this.dataByChannel["Elevation"][startIdx][1];
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
    
    var DataParser = function()
    {
        this.disabledSeries = [];
        this.flatSamples = null;
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
            this.dataByChannel = parseDataByChannel.call(this, flatSamples);

            // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
            var elevationInfo = getElevationInfoOnRange.call(this);
            this.minElevation = elevationInfo.min;
            this.elevationIsAllNegative = elevationInfo.isAllNegative;
            if (this.dataByChannel.Latitude && this.dataByChannel.Longitude)
            {
                this.hasLatLongData = true;
            }
            else
            {
                this.hasLatLongData = false;
            }
            this.latLonArray = null;
        },

        setDisabledSeries: function(series)
        {
            this.disabledSeries = series;
        },

        getSeries: function(x1, x2)
        {
            return generateSeriesFromData.call(this, this.flatSamples.channelMask, this.dataByChannel, this.elevationIsAllNegative, x1, x2);
        },

        getElevationInfo: function(x1, x2)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return getElevationInfoOnRange.call(this, x1, x2);

            return {
                min: this.minElevation,
                isAllNegative: this.elevationIsAllNegative
            };
        },

        getLatLonArray: function()
        {
            if (this.dataByChannel.Latitude && this.dataByChannel.Longitude && !this.latLonArray)
                this.latLonArray = generateLatLonFromData.call(this, this.dataByChannel);

            return this.latLonArray;
        },

        getLatLonBetweenMsOffsets: function(startMsOffset, endMsOffset)
        {
            var sampleStartIndex = this.findIndexByMsOffset(startMsOffset);
            var sampleEndIndex = this.findIndexByMsOffset(endMsOffset);
            return generateLatLonFromDataBetweenIndexes.call(this, this.dataByChannel, sampleStartIndex, sampleEndIndex);
        },

        getLatLngMsOffset: function()
        {
            if (!this.latLngMsOffset)
            {
                this.latLngMsOffset = {};

                if (_.has(this.dataByChannel, "Latitude") && _.has(this.dataByChannel, "Longitude") && (this.dataByChannel.Latitude.length === this.dataByChannel.Longitude.length))
                {
                    for (var i = 0; i < this.dataByChannel.Latitude.length; i++)
                    {
                        var lat = this.dataByChannel.Latitude[i][1];
                        var lng = this.dataByChannel.Longitude[i][1];
                        if (_.isNaN(lat) || _.isNaN(lng))
                            continue;

                        var msOffset = this.dataByChannel.Latitude[i][0];
                        var key = lat + "," + lng;
                        this.latLngMsOffset[key] = msOffset;
                    }
                }


            }

            return this.latLngMsOffset;
        },

        findMsOffsetByLatLng: function(lat, lng)
        {
            var latLngMsOffset = this.getLatLngMsOffset();

            // data from api is truncated at 5 decimals, but leaflet will give us longer values
            var key = Number(lat).toFixed(5) + "," + Number(lng).toFixed(5);

            if(latLngMsOffset.hasOwnProperty(key))
                return latLngMsOffset[key];
            else
                return null;
        },

        getYAxes: function(series)
        {
            return generateYAxes.call(this, series);
        },
        
        getChannelMask: function()
        {
            return this._channelMask;
        },

        findIndexByMsOffset: function(msOffset)
        {
            if (this.flatSamples && this.flatSamples.msOffsetsOfSamples)
                return findIndexByMsOffset(this.flatSamples.msOffsetsOfSamples, msOffset);
            else
                return null;
        },
        
        createCorrectedElevationChannel: function (elevations)
        {
            var index = 0;
            var badIndeces = [];
            
            for (var i = 0; i < this.dataByChannel["Latitude"].length; i++)
            {
                if (_.isNaN(this.dataByChannel["Latitude"][i][1]) || _.isNaN(this.dataByChannel["Longitude"][i][1]))
                    badIndeces.push(i);
            }

            _.each(badIndeces, function(badIndex)
            {
                if (badIndex === 0)
                    elevations.unshift(null);
                else
                    elevations.splice(badIndex, 0, null);
            });

            var corrected = _.map(this.dataByChannel["Elevation"], function(elevationPoint)
            {
                if (index >= (elevations.length - 1))
                    return [elevationPoint[0], null];

                return [elevationPoint[0], elevations[index++]];
            });
            return corrected;
        }

    });
    
    return DataParser;
});