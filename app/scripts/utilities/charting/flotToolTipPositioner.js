define(
[],
function()
{
    return {
        updatePosition: function($tooltipEl, flotChart, bottomLimit, rightLimit)
        {
            var canvasWidth = flotChart.width();
            var canvasHeight = flotChart.height();
            var canvasLocation = flotChart.offset();
            var tooltipWidth = $tooltipEl.width();
            var tooltipHeight = $tooltipEl.height();
            var tooltipLocation = $tooltipEl.offset();
            var canvasBottom = canvasLocation.top + canvasHeight;

            if (_.isUndefined(bottomLimit))
            {
                bottomLimit = -10;
            }

            if (_.isUndefined(rightLimit))
            {
                rightLimit = -30;
            }

            if (tooltipLocation.top + tooltipHeight > canvasBottom - bottomLimit)
            {
                var tooltipTop = (tooltipLocation.top - tooltipHeight) + 50;

                if (tooltipTop + tooltipHeight > canvasBottom - bottomLimit)
                {
                    tooltipTop = canvasBottom - tooltipHeight - bottomLimit;
                }

                $tooltipEl.css("top", tooltipTop + "px");
                $tooltipEl.addClass("bottom");
            }
            else
            {
                $tooltipEl.removeClass("bottom");
            }


            if (tooltipLocation.left + tooltipWidth > canvasLocation.left + canvasWidth - rightLimit)
            {
                var tooltipLeft = tooltipLocation.left - tooltipWidth - 60;
                $tooltipEl.css("left", tooltipLeft + "px");
                $tooltipEl.removeClass("right").addClass("left");
            }
            else
            {
                $tooltipEl.removeClass("left").addClass("right");
            }

        }       
    };

});