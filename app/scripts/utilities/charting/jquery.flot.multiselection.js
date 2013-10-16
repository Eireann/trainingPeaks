define(
[
    "underscore",
    "utilities/charting/chartColors"
],
function(
    _,
    chartColors
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
 getLastSelection
 clearMultiSelection(selection)
*/

    function init(plot)
    {

        var multiSelections = [];

        function clearMultiSelection(multiSelection)
        {
            multiSelection.show = false;
            multiSelection.temporarilyHidden = false;
            plot.triggerRedrawOverlay();
        }

        function unclearMultiSelection(multiSelection)
        {
            multiSelection.show = true;
            multiSelection.temporarilyHidden = false;
            plot.triggerRedrawOverlay();
        }

        function hideActiveSelections()
        {
            var selections = [];
            _.each(multiSelections, function(selection)
            {
                if (selection.show)
                {
                    selection.show = false;
                    selection.temporarilyHidden = true;
                }
            });

            return selections;
        }

        function unhideActiveSelections()
        {
            var selections = [];
            _.each(multiSelections, function(selection)
            {
                if (selection.temporarilyHidden)
                {
                    selection.show = true;
                    selection.temporarilyHidden = false;
                    plot.triggerRedrawOverlay();
                }
            });

            return selections;
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
                ranges: ranges,
                show: true
            };

            updateSelectionCoordinates(multiSelection);

            multiSelection.show = true;
            multiSelections.push(multiSelection);
            plot.triggerRedrawOverlay();
            return multiSelection;

        }

        function updateSelectionCoordinates(multiSelection)
        {
            var axis, range, o = plot.getOptions();

            if (o.multiSelection.mode === "y")
            {
                multiSelection.first.x = 0;
                multiSelection.second.x = plot.width();
            }
            else
            {
                range = extractRange(multiSelection.ranges, "x");

                multiSelection.first.x = range.axis.p2c(range.from);
                multiSelection.second.x = range.axis.p2c(range.to);
            }

            if (o.multiSelection.mode === "x") {
                multiSelection.first.y = 0;
                multiSelection.second.y = plot.height();
            }
            else {
                range = extractRange(multiSelection.ranges, "y");

                multiSelection.first.y = range.axis.p2c(range.from);
                multiSelection.second.y = range.axis.p2c(range.to);
            }
        }

        function hasMultiSelection()
        {
            return _.find(multiSelections, function(selection)
            {
                return selection.show;
            });
        }

        function getLastMultiSelection()
        {
            var activeSelections = _.filter(multiSelections, function(selection)
            {
                return selection.show;
            });

            return activeSelections && activeSelections.length ? activeSelections[activeSelections.length - 1] : null;
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
                if (multiSelection.show)
                {
                    updateSelectionCoordinates(multiSelection);
                    if (selectionIsSane(multiSelection))
                    {
                        var x = Math.min(multiSelection.first.x, multiSelection.second.x) + 0.5,
                            y = Math.min(multiSelection.first.y, multiSelection.second.y) + 0.5,
                            w = Math.abs(multiSelection.second.x - multiSelection.first.x) - 1,
                            h = Math.abs(multiSelection.second.y - multiSelection.first.y) - 1;

                        // Limit drawing to the currently displayed area (e.g. don't draw over tick labels when zoomed)
                        if(x < 0) { w += x; x = 0; }
                        if(y < 0) { h += y; y = 0; }
                        if(x + w > plot.width()) { w = plot.width() - x; }
                        if(y + h > plot.height()) { h = plot.height() - y; }
                        if(w < 0 || h < 0) { return; }

                        setColorBySelectionType(options, ctx);
                        ctx.fillRect(x, y, w, h);
                        ctx.strokeRect(x, y, w, h);
                    }
                }
            });

            ctx.restore();
        }

        function setColorBySelectionType(options, ctx)
        {
            var colorCode = options.color;
            var c = $.color.parse(colorCode);
            var scaledColor = c.scale('a', 0.15).toString();
            var fillStyle = scaledColor;
            var strokeStyle = scaledColor;
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
        }

        plot.clearMultiSelection = clearMultiSelection;
        plot.unclearMultiSelection = unclearMultiSelection;
        plot.addMultiSelection = addMultiSelection;
        plot.hasMultiSelection = hasMultiSelection;
        plot.getLastMultiSelection = getLastMultiSelection;
        plot.hideActiveSelections = hideActiveSelections;
        plot.unhideActiveSelections = unhideActiveSelections;

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
                    color: chartColors.chartSelection
                }
            },
            name: 'multiselection',
            version: '0.1'
        });
    }

});
