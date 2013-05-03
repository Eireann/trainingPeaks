define(
[
    "TP",
    "utilities/charting/axesBaseConfig",
    "utilities/charting/highchartsBaseConfig",
    "utilities/charting/dataParser",
    "hbs!templates/views/quickView/quickViewExpandedView"
],
function (TP, axesBaseConfig, highchartsBaseConfig, DataParser, expandedViewTemplate)
{

    var expandedViewBase =
    {
        className: "QVExpandedView",

        template:
        {
            type: "handlebars",
            template: expandedViewTemplate
        },
        
        onClose: function()
        {
            this.collapse();
        },
        
        collapse: function()
        {
            this.$el.parent().css({ display: "none" });

            if (this.resetButton)
                this.resetButton.remove();

            if (this.splineButton)
                this.splineButton.remove();

            if (this.toolTip)
                this.toolTip.remove();
        },

        initialize: function()
        {
        },
        
        onRender: function()
        {
            var self = this;

            if (!this.model.get("detailData").attributes.flatSamples)
                return;
            
            setImmediate(function()
            {
                self.createFlotGraphOnContainer();
            });
        },
        
        createFlotGraphOnContainer: function()
        {
            var self = this;

            var flatSamples = this.model.get("detailData").attributes.flatSamples;

            if (!this.dataParser)
            {
                this.dataParser = new DataParser();
                this.dataParser.loadData(flatSamples);
            }

            var series = dataParser.getSeries();
            var yaxes = [];
            var countdown = 3;
            _.each(series, function(s)
            {
                yaxes.push(
                {
                    show: true,
                    min:
                        s.name === "Elevation" ? self.dataParser.getMinimumElevation() : 0,
                    position:
                        countdown-- > 0 ? "right" : "left",
                    color:
                        s.color,
                    tickColor:
                        s.color,
                    font:
                    {
                        color: s.color
                    }
                });
            });
            
            this.flotOptions =
            {
                grid:
                {
                    show: true,
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                },
                legend:
                {
                    show: false
                },
                selection:
                {
                    mode: "x"
                },
                series:
                {
                    lines:
                    {
                        show: true,
                        lineWidth: 0.75,
                        fill: false,
                        hoverable: true
                    },
                    splines:
                    {
                        show: false,
                        lineWidth: 0.75,
                        type: "bezier"
                    }
                },
                xaxes:
                [
                    {
                        min: 0,
                        tickFormatter: function(value, axis)
                        {
                            var decimalHours = (value / (3600 * 1000)).toFixed(2);
                            return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                        }
                    }
                ],
                yaxes: yaxes
            };
            
            this.createFlotPlot(series);
            this.bindZoom();

            this.splineButton = $("<button id='flotSplineButton'></button>").css(
            {
                display: "block",
                position: "absolute",
                zIndex: 999,
                top: 200,
                left: 200
            }).text("Show Spline").appendTo("body").click(function()
            {
                self.flotOptions.series.lines.show = !self.flotOptions.series.lines.show;
                self.flotOptions.series.splines.show = !self.flotOptions.series.lines.show;
                $(this).text(self.flotOptions.series.lines.show ? "Show Spline" : "Hide Spline");
                self.createFlotPlot(startingData.flotData);
            });
        },
        
        createFlotPlot: function(data)
        {
            var plot = $.plot($("#largeGraphContainer"), data, this.flotOptions);
            this.bindTooltip();
            return plot;
        },
        
        bindTooltip: function()
        {
            var self = this;
            function showTooltip(x, y, label, color, itemX, itemY)
            {
                itemX = (itemX / (3600 * 1000)).toFixed(2);
                var time = TP.utils.datetime.format.decimalHoursAsTime(itemX, true, null);
                var content = "<b>" + label + "</b><br/>X: " + time + "</br>Y: " + itemY;
                self.toolTip = $('<div id="flottooltip">' + content + '</div>').css(
                {
                    position: "absolute",
                    display: "none",
                    top: y + 5,
                    left: x + 5,
                    border: "1px solid " + color,
                    padding: "2px",
                    "background-color": "#ffffff",
                    opacity: 1.0,
                    zIndex: 999
                }).appendTo("body").fadeIn(200);
            }

            var previousPoint = null;
            this.$("#largeGraphContainer").bind("plothover", function (event, pos, item)
            {
                if (item)
                {
                    if (previousPoint !== item.dataIndex)
                    {
                        previousPoint = item.dataIndex;

                        if(self.toolTip)
                            self.toolTip.fadeOut(200).remove();

                        var x = item.datapoint[0].toFixed(2),
                            y = item.datapoint[1].toFixed(2);

                        showTooltip(item.pageX, item.pageY, item.series.label, item.series.color, x, y);
                    }
                }
                else if(self.toolTip)
                    self.toolTip.fadeOut(100).remove();
            });
        },
        
        bindZoom: function()
        {
            var self = this;
            var top = 200;
            var left = 1000;

            this.$("#largeGraphContainer").bind("plotselected", function (event, ranges)
            {
                // Clamp the zooming to prevent eternal zoom
                if (ranges.xaxis.to - ranges.xaxis.from < 0.00001)
                    ranges.xaxis.to = ranges.xaxis.from + 0.00001;
                if (ranges.yaxis.to - ranges.yaxis.from < 0.00001)
                    ranges.yaxis.to = ranges.yaxis.from + 0.00001;

                var rangeData = self.getDataForFlot(ranges.xaxis.from, ranges.xaxis.to);

                var newOptions = {};
                _.extend(newOptions, self.flotOptions);
                newOptions.xaxes[0].min = ranges.xaxis.min;
                newOptions.xaxes[0].max = ranges.xaxis.max;

                // Redraw the zoomed plot
                self.createFlotPlot(rangeData.flotData, newOptions);

                self.resetButton = $("<button id='flotResetButton'>Reset Zoom</button>").css(
                {
                    display: "none",
                    position: "absolute",
                    zIndex: 999,
                    top: top,
                    left: left
                }).appendTo("body").fadeIn(200);

                self.resetButton.on("click", function ()
                {
                    var fullData = self.getDataForFlot(null, null);
                    self.createFlotPlot(fullData.flotData, self.flotOptions);
                    $(this).fadeOut(200).remove();
                });
            });
        }
    };

    return TP.ItemView.extend(expandedViewBase);
});