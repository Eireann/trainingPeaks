define(
[
    "TP",
    "utilities/charting/flotCustomTooltip"
],
function(TP, flotCustomToolTip)
{
    return function(series)
    {
        return _.extend({}, {
            crosshair:
            {
                mode: "x",
                color: "rgba(170, 0, 0, 0.80)",
                lineWidth: 1
                
            },
            grid:
            {
                show: true,
                borderWidth: 0,
                hoverable: true,
                clickable: true
            },
            legend:
            {
                show: false
            },
            selection:
            {
                mode: null
            },
            tooltip: true,
            tooltipOpts:
            {
                content: function(x, y)
                {
                    return "";
                },
                onHover: function(flotItem, $tooltipEl)
                {
                    $tooltipEl.html(flotCustomToolTip(series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0]));
                }
            },
            series:
            {
                lines:
                {
                    show: true,
                    lineWidth: 0.75,
                    fill: false,
                    hoverable: true
                }
            },
            xaxes:
            [
                {
                    min: 0,
                    tickFormatter: function(value, axis)
                    {
                        var decimalHours = (value / (3600 * 1000)).toFixed(2);
                        return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                    }
                }
            ]
        });
    };
});