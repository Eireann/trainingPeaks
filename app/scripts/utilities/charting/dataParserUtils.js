define(
[
    "underscore",
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(_, findOrderedArrayIndexByValue)
{
    var DataParserUtils = {

        convertFlatSamplesToOldFormat: function(flatSamples)
        {
            if(flatSamples && flatSamples.channels)
            {
                var original = flatSamples;
                var modified = {};
                var channels = _.indexBy(original.channels, "name");

                modified.msOffsetsOfSamples = channels.MillisecondOffset.samples;

                modified.channelMask = _.pluck(original.channels, "name");
                modified.samples = _.zip.apply(_, _.pluck(original.channels, "samples"));
                modified.samples = _.map(modified.samples, function(sample) { return { values: sample }; });
                modified.hasLatLngData = original.hasLatLngData;

                return modified;
            }
            else
            {
                return flatSamples;
            }
        },

        findIndexByChannelAndOffset: function(data, channel, offset, msOffsetsOfSamples)
        {
            if (channel === "time")
                return findOrderedArrayIndexByValue(msOffsetsOfSamples, offset);

            return findOrderedArrayIndexByValue(data, offset);
        },

        removeExcludedRangesFromGraphData: function(data, excludedRanges, channel, offsetType, offsetsOfSamples)
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
        },

        removeExcludedRangesFromLatLonData: function(data, excludedRanges, msOffsetsOfSamples)
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
        },

        findChannelInSeriesArray: function(seriesArray, channelName)
        {
            return _.find(seriesArray, function(s) { return s.label === channelName; });
        },

        getElevationInfo: function(data, elevationInfo, x1, x2, msOffsetsOfSamples)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return this.getElevationInfoOnRange(data, x1, x2, msOffsetsOfSamples);

            return {
                min: elevationInfo.min,
                isAllNegative: elevationInfo.isAllNegative
            };
        },

        getTemperatureMinimum: function(data, minTemperature, x1, x2, msOffsetsOfSamples)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return this.getTemperatureMinimumOnRange(data, x1, x2, msOffsetsOfSamples);

            return minTemperature;
        },

        getElevationInfoOnRange: function(dataByChannel, x1, x2, msOffsetsOfSamples)
        {
            var elevationIsAllNegative = true;
            var minElevation = 10000;

            if (_.has(dataByChannel, "Elevation"))
            {
                var startIdx = 0;
                var endIdx = dataByChannel["Elevation"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

                if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                {
                    startIdx = this.findIndexByChannelAndOffset(dataByChannel, "time", x1, msOffsetsOfSamples);
                    endIdx = this.findIndexByChannelAndOffset(dataByChannel, "time", x2, msOffsetsOfSamples);
                }

                for(startIdx; startIdx <= endIdx; startIdx++)
                {
                    var value = dataByChannel["Elevation"][startIdx][1];
                    elevationIsAllNegative = elevationIsAllNegative && (value === null ? true : value < 0);
                    value = value === null ? 999999999999999 : value;
                    if (value < minElevation) {
                        minElevation = value;
                    }
                }
            }

            return {
                min: minElevation,
                isAllNegative: elevationIsAllNegative
            };
        },

        getTemperatureMinimumOnRange: function(dataByChannel, x1, x2, msOffsetsOfSamples)
        {
            var minTemperature = 0;

            if (_.has(dataByChannel, "Temperature"))
            {
                var startIdx = 0;
                var endIdx = dataByChannel["Temperature"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

                if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                {
                    startIdx = this.findIndexByChannelAndOffset(dataByChannel, "time", x1, msOffsetsOfSamples);
                    endIdx = this.findIndexByChannelAndOffset(dataByChannel, "time", x2, msOffsetsOfSamples);
                }

                for(startIdx; startIdx <= endIdx; startIdx++)
                {
                    var value = dataByChannel["Temperature"][startIdx][1];
                    if (value !== null && value < minTemperature)
                        minTemperature = value;
                }
            }

            return minTemperature;
        }

    };
    return DataParserUtils;

});
