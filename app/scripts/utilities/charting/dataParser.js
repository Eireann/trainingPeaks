define(
[
    "utilities/charting/seriesColorByChannel",
    "utilities/charting/findIndexByMsOffset"
],
function(seriesColorByChannel, findIndexByMsOffset)
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
                    dataByChannel[channelName] = [];

                var value = sample.values[channelIdx];

                if (value != null)
                {
                    if (channelName === "Latitude" || channelName === "Longitude")
                        value = value / 100000;
                    else
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
                    fill: fillOpacity,
                },
                splines:
                {
                    fill: fillOpacity,
                },
                shadowSize: 0
            });
        });

        return seriesArray;
    };

    var getMinElevationOnDataRange = function(x1, x2)
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
                var value = this.dataByChannel["Elevation"][1];
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
    
    var DataParser = function()
    {
        this.flatSamples = null;
        this.dataByChannel = null;
        this.minElevation = null;
        this.elevationIsAllNegative = null;
        this.latLonArray = null;
    };
    
    DataParser.prototype.loadData = function(flatSamples)
    {
        this.flatSamples = flatSamples;
        this.dataByChannel = parseDataByChannel.call(this, flatSamples);

        // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
        var elevationInfo = getMinElevationOnDataRange.call(this);
        this.minElevation = elevationInfo.min;
        this.elevationIsAllNegative = elevationInfo.isAllNegative;
    };

    DataParser.prototype.getSeries = function(x1, x2)
    {
        return generateSeriesFromData.call(this, this.flatSamples.channelMask, this.dataByChannel, this.elevationIsAllNegative, x1, x2);
    };

    DataParser.prototype.getElevationInfo = function(x1, x2)
    {
        if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
            return getMinElevationOnDataRange.call(this, x1, x2);

        return {
            min: this.minElevation,
            isAllNegative: this.elevationIsAllNegative
        };
    };

    DataParser.prototype.getLatLonArray = function()
    {
        return generateLatLonFromData.call(this, this.dataByChannel);
    };

    return DataParser;
});