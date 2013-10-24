define(
[
    "utilities/charting/chartColors",
    "utilities/charting/dataParser",
    "utilities/charting/findIndexByMsOffset",
    "utilities/conversion/conversion"
],
function(chartColors, DataParser, findIndexByMsOffset, conversion)
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
