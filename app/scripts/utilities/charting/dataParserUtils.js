define(
[
    "underscore",
],
function(_)
{
    var DataParserUtils = {

        findChannelInSeriesArray: function(seriesArray, channelName)
        {
            return _.find(seriesArray, function(s) { return s.label === channelName; });
        }

    };
    return DataParserUtils;

});
