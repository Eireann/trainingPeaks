define(
[
    "utilities/charting/findIndexByMsOffset"
],
function(findIndexByMsOffset)
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
            if (x1 !== null && x2 !== null)
            {
                var startIdx = this.findIndexByMsOffset(this.seriesArray[0].data, x1);
                var endIdx = this.findIndexByMsOffset(this.seriesArray[0].data, x2);
                
                for (var idx = startIdx; idx <= endIdx; idx++)
                    data.push(series.data[idx]);
            }
            else
                data = _.clone(dataByChannel[channel]);

            seriesArray.push(
            {
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
        if (_.has(this.dataByChannel, "Elevation"))
        {
            var startIdx = findIndexByMsOffset(x1);
            var endIdx = findIndexByMsOffset(x2);
            
            self.minElevation = _.min(dataByChannel.Elevation, function (value)
            {
                // Underscore Min considers "null" a valid comparable value and will always return a min of "null"
                // if null is present in the data set, therefore need a quick hack to get around this.
                self.elevationIsAllNegative = self.elevationIsAllNegative && (value[1] === null ? true : value[1] < 0);
                return value[1] === null ? 999999999999999 : value[1];
            })[1];
        }
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
        var self = this;

        this.dataByChannel = parseDataByChannel(flatSamples);

        // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
        this.minElevation = 0;
        this.elevationIsAllNegative = true;

    };

    DataParser.prototype.getSeries = function(x1, x2)
    {
        return generateSeriesFromData(flatSamples.channelMask, this.dataByChannel, elevationIsAllNegative, x1, x2);
    };

    DataParser.prototype.getMinimumElevation = function(x1, x2)
    {
        if (x1 !== null && x2 !== null)
        {
            return getMinElevationOnDataRange(x1, x2);
        }

        return this.minElevation;
    };

    DataParser.prototype.getLatLonArray = function()
    {
        return generateLatLonFromData(this.dataByChannel);
    };

    return DataParser;
});