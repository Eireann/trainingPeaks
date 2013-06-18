define(
[
    "underscore",
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.tooltip",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/charts/peaksChart",
    "hbs!templates/views/charts/chartTooltip"
],
function (
        _,
        setImmediate,
        TP,
        defaultFlotOptions,
        flotToolTip,
        toolTipPositioner,
        peaksChartTemplate,
        tooltipTemplate)
{
        return TP.ItemView.extend(
        {
            tagName: "div",
            className: "peaksChart",

            template:
            {
                type: "handlebars",
                template: peaksChartTemplate
            },

            initialize: function(options)
            {
                if (!options.peaks)
                    throw "PeaksChartView requiers a peaks object at construction time";
                
                if (!options.peaks)
                    throw "PeaksChartView requires a peaks object at construction time";

                if (!options.chartColor)
                    throw "PeaksChartView requires a chartColor object at construction time";

                if (!options.graphTitle)
                    throw "PeaksChartView requires a graphTitle string at construction time";

                if (!options.toolTipBuilder)
                    throw "PeaksChartView requires a toolTipBuilder callback at construction time";

                this.peaks = options.peaks;
                this.peaks = options.peaks;
                this.chartColor = options.chartColor;
                this.graphTitle = options.graphTitle;

                _.bindAll(this, "onHover");
            },

            onRender: function()
            {
                if (!this.peaks)
                    return;

                var chartPoints = this.buildpeaksFlotPoints(this.peaks);
                var dataSeries = this.buildpeaksFlotDataSeries(chartPoints);
                var flotOptions = this.getFlotChartOptions(chartPoints);

                var self = this;

                // let the html draw first so our container has a height and width
                setImmediate(function()
                {
                    self.renderpeaksFlotChart([dataSeries], flotOptions);
                });
            },

            buildpeaksFlotPoints: function(peaks)
            {
                var chartPoints = [];

                _.each(peaks.peaks, function(peak, index)
                {
                    var point = [index, peak.value];
                    chartPoints.push(point);
                }, this);

                return chartPoints;
            },

            buildpeaksFlotDataSeries: function (chartPoints)
            {
                var dataSeries =
                {
                    data: chartPoints,
                    lines:
                    {
                        show: true,
                        color: "#FFFFFF",
                        fillColor: { colors: [this.chartColor.dark, this.chartColor.light] }
                    }
                };

                return dataSeries;
            },

            getFlotChartOptions: function(chartPoints)
            {
                var flotOptions = defaultFlotOptions.getSplineOptions(this.onHover);

                flotOptions.yaxis = {
                    min: 0,
                    tickDecimals: 0
                };


                flotOptions.xaxis = {
                    min: 0
                };

                return flotOptions;
            },

            renderpeaksFlotChart: function(dataSeries, flotOptions)
            {
                if (!this.$chartEl)
                    this.$chartEl = this.$(".chartContainer");

                this.plot = $.plot(this.$chartEl, dataSeries, flotOptions);
            },

            onHover: function(flotItem, $tooltipEl)
            {
                var peaksItem = this.peaks.peaks[flotItem.dataIndex];

                var tooltipData = this.toolTipBuilder(peaksItem, this.peaks);
                var tooltipHTML = tooltipTemplate(tooltipData);
                $tooltipEl.html(tooltipHTML);
                toolTipPositioner.updatePosition($tooltipEl, this.plot);
            }
        });

/*    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: function() { return ""; }
        },

        initialize: function(options)
        {
            if (!options.peaks)
                throw "PeaksChartView requiers a peaks object at construction time";
            
            if (!options.peaks)
                throw "PeaksChartView requires a peaks object at construction time";

            if (!options.chartColor)
                throw "PeaksChartView requires a chartColor object at construction time";

            if (!options.graphTitle)
                throw "PeaksChartView requires a graphTitle string at construction time";

            if (!options.chartModifier)
                throw "PeaksChartView requires a chartModifier callback at construction time";

            if (!options.toolTipBuilder)
                throw "PeaksChartView requires a toolTipBuilder callback at construction time";

            this.peaks = options.peaks;
            this.peaks = options.peaks;
            this.chartColor = options.chartColor;
            this.graphTitle = options.graphTitle;
            this.chartModifier = options.chartModifier;

            if (options.template)
            {
                this.template = options.template;
                this.$chartEl = null;
            }
            else
                this.$chartEl = this.$el;

            this.on("chartResize", this.resizeCharts, this);
        },

        onRender: function()
        {
            if (this.peaks && this.peaks.length)
            {
                var chartPoints = this.buildPeaksChartPoints(this.peaks, this.timeInZones);

                var chartOptions =
                {
                    colors: [this.chartColor],
                    title:
                    {
                        text: "Peak " + this.graphTitle
                    },
                    xAxis:
                    {
                        labels:
                        {
                            enabled: true
                        },
                        tickColor: "transparent",
                        type: "category",
                        categories: TP.utils.chartBuilder.getPeakChartCategories(chartPoints)
                    },
                    yAxis:
                    {
                        title:
                        {
                            text: "BPM"
                        }
                    }
                };

                this.chartModifier.call(this, chartOptions, chartPoints);
                this.chart = TP.utils.chartBuilder.renderSplineChart(this.$chartEl, chartPoints, tooltipTemplate, chartOptions);
            }
            else
            {
                this.$(".peaksChart").html("");
            }
        },
        
        buildPeaksChartPoints: function(peaks, timeInZones)
        {
            var chartPoints = [];
            _.each(peaks, function(peak, index)
            {
                var point =
                {
                    label: peak.label,
                    value: peak.value,
                    y: peak.value,
                    x: index
                };

                this.toolTipBuilder(point, peak, timeInZones);
                chartPoints.push(point);

            }, this);

            return chartPoints;
        },

        resizeCharts: function (width)
        {
            var self = this;
            this.$el.width(width);
            var height = width * 0.5825;
            setImmediate(function ()
            {
                self.chart.setSize(width, height - 25, false);
                $(".peaksChartContainer").css("width", width);
                $(".peaksChartContainer").css("height", height);
            });
        }
    });*/
});