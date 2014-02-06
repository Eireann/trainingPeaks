define(
[
    "jquery",
    "underscore"
],
function ($, _)
{
    var computeSumsOverPeriod = function(timeSeries, period)
    {
        var sums = [];
        var seriesLength = timeSeries.length;
        
        var currentSum = 0;
        
        for (var i = 0; i < seriesLength; i++)
        {
            if ((i + period) <= seriesLength)
            {
                for (var j = i; j < (i + period); j++)
                {
                    if(timeSeries[j] !== null)
                        currentSum += parseFloat(timeSeries[j]);
                }

                sums.push(currentSum);
                currentSum = 0;
            }
            else
                sums.push(null);
        }
        return sums;
    };

    var computeSimpleMovingAverages = function(timeSeries, period)
    {
        var movingAverages = [];
        var timeSeriesCopy = ([]).concat(timeSeries);
        var seriesLength = timeSeriesCopy.length;

        if (typeof period !== "number")
            period = seriesLength;

        var sums = computeSumsOverPeriod(timeSeriesCopy, period);

        for (var i = 0; i < seriesLength; i++)
        {
            if ((i + period) <= seriesLength)
                movingAverages.push(sums[i] / period);
            else
                movingAverages.push(null);
        }

        return movingAverages;
    };

    var computeExponentialMovingAverages = function(timeSeries, period, reverse)
    {
        var emas = [];
        var timeSeriesCopy = ([]).concat(timeSeries);

        if (reverse)
            timeSeriesCopy.reverse();
        
        var startingSma = computeSimpleMovingAverages(timeSeriesCopy.slice(0, period))[0];
        var previousEma = startingSma;
        var currentEma;

        var smoothing = 2.0 / (period + 1);
        var seriesLength = timeSeriesCopy.length;
        
        for (var i = 0; i < seriesLength; i++)
        {
            if (i <= period - 1)
                emas.push(timeSeriesCopy[i]);
            else
            {
                if (timeSeriesCopy[i] === null && period < 50)
                {
                    emas.push(null);
                    continue;
                }

                var value = _.isNaN(timeSeriesCopy[i]) || timeSeriesCopy[i] === null ? previousEma : timeSeriesCopy[i];
                currentEma = ((parseFloat(value) - previousEma) * smoothing) + previousEma;
                emas.push(currentEma);
                previousEma = currentEma;
            }
        }
        if(reverse)
            emas.reverse();
        return emas;
    };

    var applyDataFilter = function(plot, series, datapoints)
    {
        var o = plot.getOptions();

        if (!o.filter.enabled || series.label === "Elevation" || series.label === "Temperature")
            return;

        var i;
        var y;
        var timeSeries = [];

        for (i = 1; i < datapoints.points.length; i++)
        {
            if (i % 2)
            {
                y = datapoints.points[i];
                timeSeries.push(y);
            }
        }

        var filterFunction;

        switch (o.filter.type)
        {
            case "sma":
                filterFunction = computeSimpleMovingAverages;
                break;
            case "ema":
                filterFunction = computeExponentialMovingAverages;
                break;
            default:
                filterFunction = computeSimpleMovingAverages;
        }

        var filteredData = filterFunction(timeSeries, o.filter.period, false);
        
        if (o.filter.type === "ema")
            filteredData = filterFunction(filteredData, o.filter.period, true);

        for (i = 1; i < datapoints.points.length; i++)
        {
            if (i % 2)
            {
                datapoints.points[i] = filteredData.shift();
            }
        }
    };

    var setFilter = function (plot, period)
    {
        var o = plot.getOptions();

        o.filter.enabled = period !== 0 ? true : false;
        o.filter.period = period;

        plot.setData(plot.getData());
        plot.draw();
    };

    var options =
    {
        filter:
        {
            enabled: false,
            period: 10,
            type: "ema"
        }
    };
    
    if ($.plot)
    {
        $.plot.plugins.push(
        {
            init: function(plot)
            {
                plot.setFilter = function(period)
                {
                    setFilter(plot, period);
                };
                
                plot.hooks.processDatapoints.push(applyDataFilter);
            },
            options: options,
            name: "filter",
            version: "0.1"
        });
    }

    // Make this shit testable
    // Not optimal - nobody should touch this shit outside of the flot plugin registered aboved.
    var flotFilter =
    {
        setFilter: setFilter,
        applyDataFilter: applyDataFilter,
        computeSumsOverPeriod: computeSumsOverPeriod,
        computeSimpleMovingAverages: computeSimpleMovingAverages,
        computeExponentialMovingAverages: computeExponentialMovingAverages
    };
    
    return flotFilter;
});
