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
                    height: 400,
                    resetZoomEnabled: false,
                    type: "line",
                    width: 1400,
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

            this.graph = new Highcharts.Chart(this.chartConfig);
        },
        
        createFlotGraphOnContainer: function(container)
        {
            var self = this;
            
            var flotData = [];
            var yaxes = [];

            var i = 1;
            var countdown = 3;
            
            _.each(this.seriesArray, function(series)
            {
                var fill = false;

                if (series.name === "Elevation")
                    fill = 0.3;
                
                var data =
                {
                    data: series.data,
                    color: series.color,
                    label: series.name,
                    yaxis: i++,
                    lines:
                    {
                        show: true,
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
            });

            $.plot("#largeGraphContainer",
            flotData,
            {
                grid:
                {
                    show: true 
                },
                legend:
                {
                    show: false
                },
                series:
                {
                    lines:
                    {
                        lineWidth: 0.75,
                        fill: false
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
            });
        }
    };

    return TP.ItemView.extend(expandedViewBase);
});