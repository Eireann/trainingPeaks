define(
[
    "utilities/datetime/format",
    "utilities/conversion/convertToViewUnits",
    "utilities/units/labels",
    "hbs!templates/views/elevationCorrection/flotToolTip"
    ],
function(formatDateTime, convertToViewUnits, unitLabels, flotToolTipTemplate)
{
    return function(series, hoveredSeries, hoveredIndex)
    {
        var toolTipData =
        {
            series:
            [
                {
                    label: "Original",
                    value: convertToViewUnits(series[0].data[hoveredIndex][1], "elevation"),
                    current: hoveredSeries === "Original" ? true : false
                },
                {
                    label: "Corrected",
                    value: series.length === 2 ? convertToViewUnits(series[1].data[hoveredIndex][1], "elevation") : "--",
                    current: hoveredSeries === "Corrected" ? true : false
                }
            ]
        };

        return flotToolTipTemplate(toolTipData);
    };
});