define(
[
    "underscore"
],
function(
    _
    )
{
// TODO: SIMPLIFY
    /* 
   
   extracted from jquery.flot.selection
    Flot plugin for selecting regions of a plot.

Copyright (c) 2007-2013 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

selection: {
	mode: null or "x" or "y" or "xy",
	color: color,
	shape: "round" or "miter" or "bevel",
	minSize: number of pixels
}


 addMultiSelection
 clearMultiSelection(selection)
*/

    function init(plot)
    {

        var multiSelections = [];

        function clearMultiSelection(multiSelection)
        {
            if (multiSelection.show)
            {
                multiSelection.show = false;
                plot.triggerRedrawOverlay();
            }
        }

        // function taken from markings support in Flot
        function extractRange(ranges, coord)
        {
            var axis, from, to, key, axes = plot.getAxes();

            for (var k in axes) {
                axis = axes[k];
                if (axis.direction === coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n === 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord === "x" ? plot.getXAxes()[0] : plot.getYAxes()[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from != null && to != null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }
            
            return { from: from, to: to, axis: axis };
        }
        
        function addMultiSelection(ranges, options, preventEvent)
        {
            var multiSelection = {
                first: { x: -1, y: -1 }, second: { x: -1, y: -1 },
                show: true
            };

            var axis, range, o = plot.getOptions();

            if (o.multiSelection.mode === "y")
            {
                multiSelection.first.x = 0;
                multiSelection.second.x = plot.width();
            }
            else {
                range = extractRange(ranges, "x");

                multiSelection.first.x = range.axis.p2c(range.from);
                multiSelection.second.x = range.axis.p2c(range.to);
            }

            if (o.multiSelection.mode === "x") {
                multiSelection.first.y = 0;
                multiSelection.second.y = plot.height();
            }
            else {
                range = extractRange(ranges, "y");

                multiSelection.first.y = range.axis.p2c(range.from);
                multiSelection.second.y = range.axis.p2c(range.to);
            }

            multiSelection.show = true;
            multiSelection.dataType = options.dataType;
            multiSelections.push(multiSelection);
            plot.triggerRedrawOverlay();
            return multiSelection;

        }

        function selectionIsSane(multiSelection)
        {
            var minSize = plot.getOptions().multiSelection.minSize;
            return Math.abs(multiSelection.second.x - multiSelection.first.x) >= minSize &&
                Math.abs(multiSelection.second.y - multiSelection.first.y) >= minSize;
        }

        function drawSelectionBoxes(plot, ctx)
        {
            var plotOffset = plot.getPlotOffset();
            var options = plot.getOptions().multiSelection;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.lineJoin = options.shape;
            ctx.translate(plotOffset.left, plotOffset.top);

            _.each(multiSelections, function(multiSelection)
            {
                if (multiSelection.show && selectionIsSane(multiSelection))
                {
                    var x = Math.min(multiSelection.first.x, multiSelection.second.x) + 0.5,
                        y = Math.min(multiSelection.first.y, multiSelection.second.y) + 0.5,
                        w = Math.abs(multiSelection.second.x - multiSelection.first.x) - 1,
                        h = Math.abs(multiSelection.second.y - multiSelection.first.y) - 1;

                    setColorBySelectionType(options, multiSelection.dataType, ctx);

                    ctx.fillRect(x, y, w, h);
                    ctx.strokeRect(x, y, w, h);
                }
            });

            ctx.restore();
        }

        function setColorBySelectionType(options, selectionType, ctx)
        {
            var colorCode = selectionType && options.colors.hasOwnProperty(selectionType) ? options.colors[selectionType] : options.colors.defaultColor;
            var c = $.color.parse(colorCode);
            var fillStyle = c.scale('a', 0.5).toString();
            var strokeStyle = c.scale('a', 0.8).toString();
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
        }

        plot.clearMultiSelection = clearMultiSelection;
        plot.addMultiSelection = addMultiSelection;

        plot.hooks.drawOverlay.push(drawSelectionBoxes);
       
    }

    if ($.plot)
    {
        $.plot.plugins.push({
            init: init,
            options: {
                multiSelection: {
                    mode: "x", // one of null, "x", "y" or "xy"
                    shape: "round", // one of "round", "miter", or "bevel"
                    minSize: 1, // minimum number of pixels
                    colors: {
                        defaultColor: 'lightblue',
                        distance: 'lightblue',
                        pace: 'lightblue',
                        speed: 'lightblue',
                        heartrate: 'lightblue',
                        cadence: 'lightblue',
                        power: 'lightblue'
                    }
                }
            },
            name: 'multiselection',
            version: '0.1'
        });
    }

});