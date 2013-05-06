define(
[
    "TP",
    "utilities/charting/axesBaseConfig",
    "utilities/charting/highchartsBaseConfig",
    "utilities/charting/dataParser",
    "hbs!templates/views/quickView/quickViewExpandedView"
],
function (TP, axesBaseConfig, highchartsBaseConfig, dataParser, expandedViewTemplate)
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
            this.$el.parent().hide();

            if (this.resetButton)
                this.resetButton.remove();

            if (this.splineButton)
                this.splineButton.remove();
        },

        initialize: function()
        {
            this.axesConfig = {};
            _.extend(this.axesConfig, axesBaseConfig,
            {
                
            });

            this.chartConfig = {};
            _.extend(this.chartConfig, highchartsBaseConfig,
            {
                chart:
                {
                    alignTicks: true,
                    backgroundColor: "transparent",
                    height: 300,
                    resetZoomEnabled: false,
                    type: "line",
                    width: 1200,
                    zoomType: "x" 
                },
                tooltip:
                {
                    enabled: true
                },
                legend:
                {
                    enabled: false,
                    backgroundColor: '#FFFFFF',
                    layout: "horizontal",
                    verticalAlign: "top",
                    floating: false,
                    align: "center",
                    x: 0,
                    y: 0
                },
                navigator:
                {
                    enabled: true
                }
            });
        },
        
        onRender: function()
        {
            var samples = this.model.get("detailData").attributes.flatSamples.samples;
            var channelMask = this.model.get("detailData").attributes.flatSamples.channelMask;
            var data = dataParser(samples, channelMask);

            this.seriesArray = data.seriesArray;
            this.lanLonArray = data.latLonArray;
            this.minElevation = data.minElevation;

            var self = this;
            setImmediate(function()
            {
                self.createGraphOnContainer(self.$("#largeGraphContainer2")[0]);
                self.createFlotGraphOnContainer();
            });
        },
        
        createGraphOnContainer: function(container)
        {
            var self = this;

            if (this.graph)
                this.graph.destroy();

            var orderedAxes = [];
            var i = 0;

            _.each(this.seriesArray, function (series)
            {
                var seriesAxis = self.axesConfig[series.name];

                seriesAxis.lineWidth = 1;
                seriesAxis.title = series.name;
                
                if (series.name === "Elevation" && self.minElevation > 0)
                    seriesAxis.min = self.minElevation;

                series.yAxis = i++;
                orderedAxes.push(seriesAxis);
            });

            this.chartConfig.chart.renderTo = container;
            this.chartConfig.yAxis = orderedAxes;
            this.chartConfig.series = this.seriesArray;

            this.graph = new Highcharts.StockChart(this.chartConfig);
        },
        
        findIndexByMsOffset: function (list, offset)
        {
            if (list.length === 0)
                return -1;

            var low = 0;
            var high = list.length - 1;
            var midpoint = 0;

            if (list[low][0] >= offset)
                return low;
            else if (list[high][0] <= offset)
                return high;

            while (low <= high)
            {
                midpoint = low + Math.ceil((high - low) / 2.0);

                // We need do this check here for smart-recorded files
                if (list[low][0] >= offset)
                    return low;
                else if (list[high][0] <= offset)
                    return high;

                if (offset >= list[midpoint][0] && offset <= list[midpoint + 1][0])
                {
                    // For a smart-recorded file it could be midpoint, or midpoint+1
                    if (offset === list[midpoint + 1][0])
                        return midpoint + 1;
                    else
                        return midpoint;
                }
                else if (offset < list[midpoint][0])
                    high = midpoint - 1;
                else
                    low = midpoint + 1;
            }

            return -1;
        },
        
        getDataForFlot: function(x1, x2)
        {
            var countdown = 3;
            var flotData = [];
            var yaxes = [];

            var startIdx = null;
            var endIdx = null;

            if (x1 !== null && x2 !== null)
            {
                startIdx = this.findIndexByMsOffset(this.seriesArray[0].data, x1);
                endIdx = this.findIndexByMsOffset(this.seriesArray[0].data, x2);
            }
            
            for (var i = 0; i < this.seriesArray.length; i++)
            {
                var series = this.seriesArray[i];
                var fill = false;

                if (series.name === "Elevation")
                    fill = 0.3;

                var seriesData = [];
                if (startIdx !== null && endIdx !== null)
                {
                    for (var idx = startIdx; idx <= endIdx; idx++)
                        seriesData.push(series.data[idx]);
                }
                else
                    seriesData = series.data;

                var data =
                {
                    data: seriesData,
                    color: series.color,
                    label: series.name,
                    yaxis: i + 1,
                    lines:
                    {
                        //show: false,
                        fill: fill
                    },
                    splines:
                    {
                        //show: true,
                        fill: fill
                    },
                    shadowSize: 0
                };

                var yAxis =
                {
                    show: true,
                    min: series.name === "Elevation" ? this.minElevation : 0,
                    position: countdown-- > 0 ? "right" : "left",
                    color: series.color,
                    tickColor: series.color,
                    font:
                    {
                        color: series.color
                    }
                };

                flotData.push(data);
                yaxes.push(yAxis);
            }

            return {
                flotData: flotData,
                yaxes: yaxes
            };
        },
        
        createFlotGraphOnContainer: function()
        {
            var self = this;
            
            var startingData = this.getDataForFlot(0, this.seriesArray[0].data[this.seriesArray[0].data.length - 1][0]);
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
                yaxes: startingData.yaxes
            };
            
            this.createFlotPlot(startingData.flotData);
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
            function showTooltip(x, y, label, color, itemX, itemY)
            {
                itemX = (itemX / (3600 * 1000)).toFixed(2);
                var time = TP.utils.datetime.format.decimalHoursAsTime(itemX, true, null);
                var content = "<b>" + label + "</b><br/>X: " + time + "</br>Y: " + itemY;
                $('<div id="flottooltip">' + content + '</div>').css(
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

                        $("#flottooltip").fadeOut(200).remove();
                        var x = item.datapoint[0].toFixed(2),
                            y = item.datapoint[1].toFixed(2);

                        showTooltip(item.pageX, item.pageY, item.series.label, item.series.color, x, y);
                    }
                }
                else
                    $("#flottooltip").fadeOut(100).remove();
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