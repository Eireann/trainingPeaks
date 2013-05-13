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
        var resetButton;

        function bindEvents(plot, eventHolder)
        {
            var o = plot.getOptions();
            if (o.zoom.enabled === true)
            {
                startingMin = plot.getOptions().xaxes[0].min;
                startingMax = plot.getOptions().xaxes[0].max;
                startingYAxes = _.extend({}, plot.getOptions().yaxes);
                dataParser = plot.getOptions().zoom.dataParser;

                plot.getPlaceholder().bind("plotselected", plot.zoomToSelection);
            }
        }

        function shutdown(plot, eventHolder)
        {
            plot.getPlaceholder().unbind("plotselected", plot.zoomToSelection);
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

            resetButton.off("click", plot.resetZoom).fadeOut(200).remove();
        };

        plot.zoomToSelection = function (event, ranges)
        {
            if (ranges.xaxis.to - ranges.xaxis.from < 0.00001)
                ranges.xaxis.to = ranges.xaxis.from + 0.00001;

            var zoomedSeriesData = dataParser.getSeries(ranges.xaxis.from, ranges.xaxis.to);
            var yaxes = dataParser.getYAxes(zoomedSeriesData);

            var o = plot.getOptions();
            o.xaxes[0].min = ranges.xaxis.from;
            o.xaxes[0].max = ranges.xaxis.to;
            o.yaxes = yaxes;

            doZoomOnCanvas();

            if (resetButton)
                resetButton.remove();

            resetButton = $("<button id='flotResetButton'>Reset Zoom</button>").css(
            {
                display: "none",
                position: "absolute",
                zIndex: 999,
                top: 20,
                left: 20
            }).appendTo(plot.getPlaceholder()).fadeIn(200);

            resetButton.on("click", plot.resetZoom);
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