define(
[
    "utilities/charting/dataParser",
    "utilities/charting/dataParserUtils"
],
function(DataParser, DataParserUtils)
{

    var ScatterDataParser = {};

    _.extend(ScatterDataParser, DataParser);
    _.extend(ScatterDataParser.prototype,
    {
        setXAxis: function (xaxis)
        {
            this.xaxis = xaxis;
        }

    });

    return ScatterDataParser;
});
