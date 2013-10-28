define(
[
    "utilities/charting/chartColors",
    "utilities/conversion/conversion",
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(chartColors, conversion, findOrderedArrayIndexByValue)
{
    var FlotUtils = {
        generateYAxes: function(series, workoutTypeValueId, data)
        {
            var yaxes = [];
            var countdown = (series.length / 2).toFixed(0);
            var axisIndex = 1;
            _.each(series, function(s)
            {
                var showSpeedAsPace = s.label === "Speed" && _.contains([1,3,12,13], workoutTypeValueId);
                if (s.label === "Pace")
                    return;

                s.yaxis = axisIndex++;
                var axisOptions =
                {
                    show: true,
                    label: s.label,
                    min: FlotUtils.getMinimumForAxis(s.label, data),
                    position: countdown-- > 0 ? "right" : "left",
                    color: "transparent",
                    tickColor: "transparent",
                    font:
                    {
                        color: chartColors.seriesColorByChannel[s.label]
                    },
                    tickFormatter: function(value)
                    {
                        // Purposefully using the closure created above to capture s.label for each given axis,
                        // in order to easily obtain the correct unit conversion for each axis.
                        // For some reason, a '0' value returns a NaN, check for it.

                        // Swim workouts need to format "Speed" as "Pace"
                        if (showSpeedAsPace)
                        {
                            return value === 0 ? +0 : conversion.formatUnitsValue("pace", value, { defaultValue: null, workoutTypeId: workoutTypeValueId } );
                        }
                        return value === 0 && s.label !== "Temperature" ? +0 : parseInt(conversion.formatUnitsValue(s.label.toLowerCase(), value, {workoutTypeValueId: workoutTypeValueId}), 10);
                    },
                    labelWidth: showSpeedAsPace ? 27 : 15
                };

                yaxes.push(axisOptions);
            });
            return yaxes;
        },

        getMinimumForAxis: function(series, data)
        {
            switch(series)
            {

                case "Elevation":
                    return this.getElevationInfo(data).min;

                case "Temperature":
                    return this.getTemperatureMinimum(data);

                default:
                    return 0;
            }
        },

        getElevationInfo: function(data, x1, x2)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return getElevationInfoOnRange(data, x1, x2);

            return {
                min: this.minElevation,
                isAllNegative: this.elevationIsAllNegative
            };
        },

        getTemperatureMinimum: function(data, x1, x2)
        {
            if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                return getTemperatureMinimumOnRange(data, x1, x2);

            return this.minTemperature;
        },

        getElevationInfoOnRange: function(dataByChannel, x1, x2)
        {
            var elevationIsAllNegative = true;
            var minElevation = 10000;

            if (_.has(dataByChannel, "Elevation"))
            {
                var startIdx = 0;
                var endIdx = dataByChannel["Elevation"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

                if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                {
                    startIdx = findIndexByXAxisOffset.call(this, x1);
                    endIdx = findIndexByXAxisOffset.call(this, x2);
                }

                for(startIdx; startIdx <= endIdx; startIdx++)
                {
                    var value = dataByChannel["Elevation"][startIdx][1];
                    elevationIsAllNegative = elevationIsAllNegative && (value === null ? true : value < 0);
                    value = value === null ? 999999999999999 : value;
                    if (value < minElevation)
                        minElevation = value;
                }
            }

            return {
                min: minElevation,
                isAllNegative: elevationIsAllNegative
            };
        },

        getTemperatureMinimumOnRange: function(dataByChannel, x1, x2)
        {
            var minTemperature = 0;

            if (_.has(dataByChannel, "Temperature"))
            {
                var startIdx = 0;
                var endIdx = dataByChannel["Temperature"].length - 1; //this.flatSamples.msOffsetsOfSamples.length - 1;

                if (typeof x1 !== "undefined" && typeof x2 !== "undefined")
                {
                    startIdx = findIndexByXAxisOffset.call(this, x1);
                    endIdx = findIndexByXAxisOffset.call(this, x2);
                }

                for(startIdx; startIdx <= endIdx; startIdx++)
                {
                    var value = dataByChannel["Temperature"][startIdx][1];
                    if (value !== null && value < minTemperature)
                        minTemperature = value;
                }
            }

            return minTemperature;
        },

    };

    return FlotUtils;

});