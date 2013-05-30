define(
[],
function ()
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


 setMultiSelection
 clearMultiSelection(selection)
*/

    function init(plot)
    {

        var multiSelection = {
            first: { x: -1, y: -1 }, second: { x: -1, y: -1 },
            show: true
            };

        function clearMultiSelection()
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
        
        function setMultiSelection(ranges, preventEvent) {
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
            plot.triggerRedrawOverlay();

        }

        function selectionIsSane() {
            var minSize = plot.getOptions().multiSelection.minSize;
            return Math.abs(multiSelection.second.x - multiSelection.first.x) >= minSize &&
                Math.abs(multiSelection.second.y - multiSelection.first.y) >= minSize;
        }

        function drawSelectionBox(plot, ctx)
        {
            // draw selection
            if (multiSelection.show && selectionIsSane()) {
                var plotOffset = plot.getPlotOffset();
                var o = plot.getOptions();

                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse(o.multiSelection.color);

                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 1;
                ctx.lineJoin = o.multiSelection.shape;
                ctx.fillStyle = c.scale('a', 0.4).toString();

                var x = Math.min(multiSelection.first.x, multiSelection.second.x) + 0.5,
                    y = Math.min(multiSelection.first.y, multiSelection.second.y) + 0.5,
                    w = Math.abs(multiSelection.second.x - multiSelection.first.x) - 1,
                    h = Math.abs(multiSelection.second.y - multiSelection.first.y) - 1;

                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);

                ctx.restore();
            }
        }

        plot.clearMultiSelection = clearMultiSelection;
        plot.setMultiSelection = setMultiSelection;

        plot.hooks.drawOverlay.push(drawSelectionBox);
       
    }

    if ($.plot)
    {
        $.plot.plugins.push({
            init: init,
            options: {
                multiSelection: {
                    mode: null, // one of null, "x", "y" or "xy"
                    color: "#accfe8",
                    shape: "round", // one of "round", "miter", or "bevel"
                    minSize: 5 // minimum number of pixels
                }
            },
            name: 'multiselection',
            version: '0.1'
        });
    }

});