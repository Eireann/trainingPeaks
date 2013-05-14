define(
[
    "utilities/charting/seriesColorByChannel",
    "utilities/charting/findIndexByMsOffset",
    "utilities/conversion/convertToViewUnits"
],
function(seriesColorByChannel, findIndexByMsOffset, convertToViewUnits)
{
    var parseDataByChannel = function(flatSamples)
    {
        var dataByChannel = {};
        var previousElevation = null;

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

            seriesArray.push(
            {
                color: seriesColorByChannel[channel],
                data: data,
                label: channel,
                lines:
                {
                    fill: fillOpacity
                },
                shadowSize: 0
            });
        });

        return seriesArray;
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
        var latLon = [];
        
        if (_.has(dataByChannel, "Latitude") && _.has(dataByChannel, "Longitude") && (dataByChannel.Latitude.length === dataByChannel.Longitude.length))
        {
            for (var i = 0; i < dataByChannel.Latitude.length; i++)
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
        var countdown = 3;
        var axisIndex = 1;
        _.each(series, function(s)
        {
            s.yaxis = axisIndex++;
            yaxes.push(
            {
                show: true,
                label: s.label,
                min: s.label === "Elevation" ? self.getElevationInfo().min : 0,
                position: countdown-- > 0 ? "right" : "left",
                color: s.color,
                tickColor: s.color,
                font:
                {
                    color: s.color
                },
                tickFormatter: function(value)
                {
                    // Purposefully using the closure created above to capture s.label for each given axis,
                    // in order to easily obtain the correct unit conversion for each axis.
                    // For some reason, a '0' value returns a NaN, check for it.
                    return value === 0 ? +0 : parseInt(convertToViewUnits(value, s.label.toLowerCase()), 10);
                }
            });
        });
        return yaxes;
    };
    
    var DataParser = function()
    {
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
            this.latLonArray = null;

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
            if (!this.latLonArray)
                this.latLonArray = generateLatLonFromData.call(this, this.dataByChannel);

            return this.latLonArray;
        },

        getYAxes: function(series)
        {
            return generateYAxes.call(this, series);
        },
        
        getChannelMask: function()
        {
            return this._channelMask;
        }
    });
    
    return DataParser;
});