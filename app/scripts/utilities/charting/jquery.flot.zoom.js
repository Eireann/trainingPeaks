define(
[],
function ()
{
    var options =
    {
        zoom:
        {
            enabled: false
        }
    };

    function init(plot)
    {
        var startingMin;
        var startingMax;
        var startingYAxes;

        var dataParser;

        function bindEvents(plot, eventHolder)
        {
            var o = plot.getOptions();
            if (o.zoom.enabled === true)
            {
                startingMin = plot.getOptions().xaxes[0].min;
                startingMax = plot.getOptions().xaxes[0].max;
                startingYAxes = _.extend({}, plot.getOptions().yaxes);
                dataParser = plot.getOptions().zoom.dataParser;
            }
        }

        function shutdown(plot, eventHolder)
        {
        }

        function doZoomOnCanvas()
        {
            plot.setupGrid();
            plot.draw();
            plot.getPlaceholder().trigger("plotzoom", [plot]);
        }

        plot.resetZoom = function ()
        {
            var o = plot.getOptions();
            o.xaxes[0].min = startingMin;
            o.xaxes[0].max = startingMax;
            o.yaxes = startingYAxes;
           
            doZoomOnCanvas();
        };

        plot.zoomToSelection = function ()
        {
            var ranges = plot.getSelection();

            if (!ranges)
                return false;
            
            if (ranges.xaxis.to - ranges.xaxis.from < 0.00001)
                ranges.xaxis.to = ranges.xaxis.from + 0.00001;

            var zoomedSeriesData = dataParser.getSeries(ranges.xaxis.from, ranges.xaxis.to);
            var yaxes = dataParser.getYAxes(zoomedSeriesData);

            var o = plot.getOptions();
            o.xaxes[0].min = ranges.xaxis.from;
            o.xaxes[0].max = ranges.xaxis.to;
            o.yaxes = yaxes;

            doZoomOnCanvas();

            plot.clearSelection();

            return true;
        };

        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
    }
    
    if ($.plot)
    {
        $.plot.plugins.push(
        {
            init: init,
            options: options,
            name: "zoom",
            version: "0.1"
        });
    }
});