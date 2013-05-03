(function ($)
{
	function getControlPoints(x0, y0, x1, y1, x2, y2, tension)
	{
	    var pow = Math.pow, sqrt = Math.sqrt, d01, d12, fa, fb, p1x, p1y, p2x, p2y;

	    d01 = sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2));
	    d12 = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));

	    fa = tension * d01 / (d01 + d12);
	    fb = tension - fa;

	    p1x = x1 + fa * (x0 - x2);
	    p1y = y1 + fa * (y0 - y2);

	    p2x = x1 - fb * (x0 - x2);
	    p2y = y1 - fb * (y0 - y2);

	    return [p1x, p1y, p2x, p2y];
	}

	function draw(ctx, type, points, cpoints)
	{
		// if type is undefined or bad, it defaults to 'quadratic'
		if (type === void 0 || (type !== 'bezier' && type !== 'quadratic')) {
			type = 'quadratic';
		}
		type = type + 'CurveTo';

		ctx.beginPath();
		// move to first point position
		ctx.moveTo(points[0], points[1]);
		// draw a bezier curve from the first point to the second point,
		// using the given set of control points
		ctx[type].apply(ctx, cpoints.concat(points.slice(2)));
		ctx.stroke();
		ctx.closePath();

	}

	function drawSpline(plot, ctx, series)
	{
		// Not interested if spline is not requested
		if (series.splines.show !== true)
			return;
		
	    var cp = [],   // array of control points
	    	tension = series.splines.tension || 0.5,
	    	idx,
	    	x,
	    	y,
	    	points = series.datapoints.points,
	    	ps = series.datapoints.pointsize,
	    	plotOffset = plot.getPlotOffset(),
	    	len = points.length,
	    	pts = [];

	    // Cannot display a linespline/areaspline if there are less than 3 points
	    if (len / ps < 4)
		{
	    	$.extend(series.lines, series.splines);
	    	return;
	    }

        for (idx = 0; idx < len; idx += ps)
		{
            x = points[idx];
            y = points[idx + 1];
            if (x == null || x < series.xaxis.min || x > series.xaxis.max || y < series.yaxis.min || y > series.yaxis.max)
                continue;
   
       		pts.push(series.xaxis.p2c(x), series.yaxis.p2c(y));
        }

        len = pts.length;

	    // Draw an open curve, not connected at the ends
	    for (idx = 0; idx < len - 4; idx += 2) 
		{
	        cp = cp.concat(getControlPoints.apply(this, pts.slice(idx, idx + 6).concat([tension])));
	    }

	    ctx.save();
    	ctx.translate(plotOffset.left, plotOffset.top);
    	ctx.strokeStyle = series.color;
    	ctx.lineWidth = series.splines.lineWidth;

	    for (idx = 2; idx < len - 5; idx += 2) {
	    	draw(ctx, 'bezier', pts.slice(idx, idx + 4), cp.slice(2 * idx - 2, 2 * idx + 2));
	    }

	    //  For open curves the first and last arcs are simple quadratics
	    draw(ctx, 'quadratic', pts.slice(0, 4), cp.slice(0, 2));
	    draw(ctx, 'quadratic', pts.slice(len - 2, len), [cp[2 * len - 10], cp[2 * len - 9], pts[len -4], pts[len - 3]]);

		ctx.restore();
	}

    $.plot.plugins.push({
        init: function(plot) {
            plot.hooks.drawSeries.push(drawSpline);
        },
        options: {
            series: {
                splines: {
                    show: false,
                    lineWidth: 2,
                    tension: 0.5
                }
            }
        },
        name: 'spline',
        version: '0.8.1'
    });
})(jQuery);