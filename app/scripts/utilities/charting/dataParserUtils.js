define(
[
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(findOrderedArrayIndexByValue)
{
    var DataParserUtils = {

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
        }


    };
    return DataParserUtils;

});