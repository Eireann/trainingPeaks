define(
[
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "hbs!templates/views/quickView/zonesTab/timeInZonesChart",
    "hbs!templates/views/quickView/zonesTab/chartTooltip"
],
function(
    setImmediate,
    TP,
    flotOptions,
    timeInZonesChartTemplate,
    tooltipTemplate)
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "timeInZonesChart",

        template:
        {
            type: "handlebars",
            template: timeInZonesChartTemplate
        },

        initialize: function (options)
        {
            if (!options.timeInZones)
                throw "TimeInZonesChartView requires a timeInZones object at construction time";

            if (!options.chartColor)
                throw "TimeInZonesChartView requires a chartColor object at construction time";

            if (!options.graphTitle)
                throw "TimeInZonesChartView requires a graphTitle string at construction time";

            if (!options.toolTipBuilder)
                throw "TimeInZonesChartView requires a toolTipBuilder callback at construction time";

            this.timeInZones = options.timeInZones;
            this.chartColor = options.chartColor;
            this.graphTitle = options.graphTitle;
            this.toolTipBuilder = options.toolTipBuilder;

            if (options.template)
            {
                this.template = options.template;
            }

            this.on("chartResize", this.resizeCharts, this);
        },

        //        onRender: function()
        //        {
        //            if (!this.timeInZones)
        //                return;
        //
        //            var chartPoints = this.buildTimeInZonesChartPoints(this.timeInZones);
        //
        //            var chartOptions =
        //            {
        //                colors: [this.chartColor],
        //                title:
        //                {
        //                    text: this.graphTitle + " by Zones"
        //                },
        //                xAxis:
        //                {
        //                    title:
        //                    {
        //                        text: "ZONES"
        //                    }
        //                },
        //                yAxis:
        //                {
        //                    title:
        //                    {
        //                        text: "MINUTES"
        //                    }
        //                }
        //            };
        //            
        //            if (!this.$chartEl)
        //                this.$chartEl = this.$el.find("div.chartContainer");
        //            
        //            this.chart = TP.utils.chartBuilder.renderColumnChart(this.$chartEl, chartPoints, tooltipTemplate, chartOptions);
        //        },
        /*
        buildTimeInZonesChartPoints: function (timeInZones)
        {
            var chartPoints = [];
            var totalSeconds = TP.utils.chartBuilder.calculateTotalTimeInZones(timeInZones);

            // zone times are in seconds, convert to minutes
            _.each(timeInZones.timeInZones, function (timeInZone, index)
            {
                var minutes = timeInZone.seconds ? parseInt(timeInZone.seconds, 10) / 60 : 0;

                var point =
                {
                    label: timeInZone.label,
                    minimum: timeInZone.minimum,
                    maximum: timeInZone.maximum,
                    percentTime: TP.utils.conversion.toPercent(timeInZone.seconds, totalSeconds),
                    seconds: timeInZone.seconds,
                    y: minutes,
                    value: minutes,
                    x: index
                };

                // gives our view or other listeners a hook to modify the point
                this.toolTipBuilder.call(this, point, timeInZone);
                chartPoints.push(point);

            }, this);

            return chartPoints;
        },
        */

        buildTimeInZonesFlotPoints: function (timeInZones)
        {
            var chartPoints = [];

            _.each(timeInZones.timeInZones, function (timeInZone, index)
            {
                var minutes = timeInZone.seconds ? parseInt(timeInZone.seconds, 10) / 60 : 0;

                var point = [index, minutes];
                chartPoints.push(point);
            }, this);

            return chartPoints;
        },

        buildTimeInZonesFlotDataSeries: function (chartPoints)
        {
            //            colors: [chartColors.gradients.elevation.dark, chartColors.gradients.elevation.light]
            var dataSeries =
            {
                data: chartPoints,
                label: "ZONES",
                bars:
                {
                    show: true,
                    lineWidth: 0,
                    fill: true,
                    fillColor: { colors: [this.chartColor.light, this.chartColor.dark] }
                }
            };

            return dataSeries;
        },

        renderTimeInZonesFlotChart: function (dataSeries)
        {

            _.bindAll(this, "formatXAxisTick", "formatYAxisTick");
            this.flotOptions = flotOptions.getBarOptions(null);

            this.flotOptions.series = {bars: {show: true}};
            if (!this.flotOptions.bars)
                this.flotOptions.bars = {};
            this.flotOptions.bars.barWidth = 0.8;
            this.flotOptions.yaxis = {
                min: 0,
                ticks: 6,
                tickFormatter: this.formatYAxisTick
            };

            this.flotOptions.grid = {
                show: true,
                borderWidth: 0,
                hoverable: true,
                clickable: true,
                autoHighlight: true
            };
          
            delete this.flotOptions.xaxes;
            this.flotOptions.xaxis = {
                min: 0,
                tickFormatter: this.formatXAxisTick,
                color: 'transparent'
            };

            if (!this.$chartEl)
                this.$chartEl = this.$(".chartContainer");

            this.plot = $.plot(this.$chartEl, dataSeries, this.flotOptions);
        },

        formatXAxisTick: function(value, axis)
        {

            if (this.timeInZones.timeInZones[value])
            {
                var label = this.timeInZones.timeInZones[value].label;
                return label.substring(0, 7);
            } else
            {
                return "";
            }
        },

        formatYAxisTick: function(value, axis)
        {
            return value.toFixed(0);
        },

        onRender: function()
        {
            if (!this.timeInZones)
                return;

            var chartPoints = this.buildTimeInZonesFlotPoints(this.timeInZones);

            var dataSeries = this.buildTimeInZonesFlotDataSeries(chartPoints);

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderTimeInZonesFlotChart([dataSeries]);
            });
        },

        resizeCharts: function (width)
        {
            //            var self = this;
            //            this.$el.width(width);
            //            var height = width * 0.5825;
            //            setImmediate(function ()
            //            {
            //                self.chart.setSize(width, height, false);
            //                $(".timeInZonesChartContainer").css("width", width);
            //                $(".timeInZonesChartContainer").css("height", height);
            //
            //            });
        }
    });
});