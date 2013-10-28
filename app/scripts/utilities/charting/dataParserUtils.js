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
        }
    };
    return DataParserUtils;

});