define(
[
    "underscore",
    "utilities/charting/dataParserUtils",
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(_, DataParserUtils, findOrderedArrayIndexByValue)
{
    var DataParser = function(options) {
        if(!options.graphData)
        {
            throw Error("DataParser requires a graphData object");
        }
        this.graphData = options.graphData;
    };

    _.extend(DataParser.prototype,
    {
        loadData:  function(flatSamples)
        {
            // Re-initialize so array's don't double in length
            this.graphData.xAxisDistanceValues = [];

            this.graphData.flatSamples = flatSamples;
            this.graphData.dataByAxisAndChannel = this.parseDataByAxisAndChannel(flatSamples, this.graphData.xAxisDistanceValues);

            // Find the minimum elevation in order to properly adjust the area graph (which would default to a 0 minimum).
            this.graphData.elevationInfo = DataParserUtils.getElevationInfoOnRange(this.graphData.dataByAxisAndChannel[this.graphData.xaxis], flatSamples);

            this.graphData.minTemperature = DataParserUtils.getTemperatureMinimumOnRange(this.graphData.dataByAxisAndChannel[this.graphData.xaxis]);

            if (this.graphData.dataByAxisAndChannel && this.graphData.dataByAxisAndChannel[this.graphData.xaxis] && this.graphData.dataByAxisAndChannel[this.graphData.xaxis].Latitude && this.graphData.dataByAxisAndChannel[this.graphData.xaxis].Longitude)
                this.graphData.hasLatLongData = true;
            else
                this.graphData.hasLatLongData = false;

            this.graphData.latLonArray = null;
        },

        parseDataByAxisAndChannel: function(flatSamples, xAxisDistanceValues)
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
                    }

                    var value = sample.values[channelIdx];

                    /*
                    if (value != null)
                    {
                        if (channelName === "Latitude" || channelName === "Longitude")
                            value = value / 100000;
                        else if (!(channelName === "Power" || channelName === "Cadence" || channelName === "HeartRate" || channelName === "RightPower"))
                            value = value / 100;
                    }
                    */

                    var xAxisTimeOffset = flatSamples.msOffsetsOfSamples[sampleIdx];

                    var xAxisDistanceOffset = null;
                    if (distanceChannelIdx !== -1)
                        xAxisDistanceOffset = sample.values[distanceChannelIdx];
                        //xAxisDistanceOffset = sample.values[distanceChannelIdx] / 100;

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

            // This allows no special hacks for Time in the graphing of data
            dataByAxisAndChannel.time['Time'] = [];
            _.each(flatSamples.msOffsetsOfSamples, function(ms)
            {
                dataByAxisAndChannel.time['Time'].push([ms, ms]);
            });

            return dataByAxisAndChannel;
        }

    });

    return DataParser;
});
