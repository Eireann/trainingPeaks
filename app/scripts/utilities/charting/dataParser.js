define(
[
    "utilities/charting/chartColors",
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(chartColors, findOrderedArrayIndexByValue)
{
    var defaultChannelOrder =
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

    _.extend(DataParser, {defaultChannelOrder: defaultChannelOrder});
    _.extend(DataParser.prototype,
    {
        loadData:  function(flatSamples)
        {
            //TODO: implement in child
            throw("implement in child");
        },

        setDisabledSeries: function(series)
        {
            this.disabledSeries = series;
        },

        getSeries: function(x1, x2)
        {
            //TODO: implement in child
            throw("implement in child");
        },


        getLatLonArray: function()
        {
            // TODO: probably delete completely from here, not necessarily needed in all children
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
