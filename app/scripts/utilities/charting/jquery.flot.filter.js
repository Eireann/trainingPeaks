define(
[],
function ()
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

    var computeExponentialMovingAverages = function(timeSeries, period)
    {
        var emas = [];
        var timeSeriesCopy = ([]).concat(timeSeries);

        timeSeriesCopy.reverse();

        var startingSma;
        var previousEma = startingSma = computeSimpleMovingAverages(timeSeriesCopy.slice(0, period))[0];
        var currentEma;

        var smoothing = 2.0 / (period + 1);

        if (plot.getOptions().smoothing !== null)
            smoothing = plot.getOptions().smoothing;
        
        var seriesLength = timeSeriesCopy.length;
        
        for (var i = 0; i < seriesLength; i++)
        {
            if (i < period - 1)
                emas.push(null);
            else if (i == period - 1)
                emas.push(startingSma);
            else
            {
                if (timeSeriesCopy[i] === null)
                {
                    emas.push(null);
                    continue;
                }
                
                var value = _.isNaN(timeSeriesCopy[i]) ? previousEma : timeSeriesCopy[i];
                currentEma = ((parseFloat(value) - previousEma) * smoothing) + previousEma;
                emas.push(currentEma);
                previousEma = currentEma;
            }
        }
        emas.reverse();
        return emas;
    };

    var computeGaussianFilter = function()
    {
    };

    var originalData = {};

    var applyDataFilter = function(plot, series, data)
    {
        if (_.isEmpty(originalData))
            _.extend(originalData, series);
        
        var o = plot.getOptions();
        
        if (!o.filter.enabled || series.label === "Elevation")
            return;
        
        var i;
        var y;
        var timeSeries = [];
        
        for (i = 1; i < data.length; i++)
        {
            y = data[i][1];
            timeSeries.push(y);
        }

        var filterFunction;


        switch (o.filter.type)
        {
            case "sma":
                filterFunction = computeSimpleMovingAverages;
            case "ema":
                filterFunction = computeExponentialMovingAverages;
            case "gauss":
                filterFunction = computeGaussianFilter;
            default:
                filterFunction = computeSimpleMovingAverages;
        }

        var filteredData = filterFunction(timeSeries, o.filter.period);
        
        for (i = 1; i < data.length; i++)
        {
            y = filteredData[i];
            data[i][1] = y;
        }
    };

    var setFilter = function(plot, period)
    {
        var o = plot.getOptions();

        o.filter.enabled = period !== 0 ? true : false;
        o.filter.period = period;

        plot.setData(originalData);
        plot.setupGrid();
        plot.draw();
    };

    var options =
    {
        filter:
        {
            enabled: false,
            period: 10,
            smoothing: null,
            type: "sma"
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
                
                plot.hooks.processRawData.push(applyDataFilter);
            },
            options: options,
            name: "filter",
            version: "0.1"
        });
    }
});