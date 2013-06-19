﻿define(
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
                    throw "PeaksChartView requires a peaks object at construction time";

                if (!options.timeInZones)
                    throw "PeaksChartView requires a timeInZones object at construction time";

                if (!options.chartColor)
                    throw "PeaksChartView requires a chartColor object at construction time";

                if (!options.toolTipBuilder)
                    throw "PeaksChartView requires a toolTipBuilder callback at construction time";

                this.peaks = options.peaks;
                this.timeInZones = options.timeInZones;
                this.chartColor = options.chartColor;

                _.bindAll(this, "onHover", "formatXAxisTick", "formatYAxisTick");
            },

            onRender: function()
            {
                if (!this.peaks)
                    return;

                var chartPoints = this.buildPeaksFlotPoints(this.peaks);
                var dataSeries = this.buildPeaksFlotDataSeries(chartPoints, this.chartColor);
                var flotOptions = this.buildFlotChartOptions();

                var self = this;

                // let the html draw first so our container has a height and width
                setImmediate(function()
                {
                    self.renderpeaksFlotChart(dataSeries, flotOptions);
                });
            },

            buildPeaksFlotPoints: function(peaks)
            {
                var chartPoints = [];

                _.each(peaks, function(peak, index)
                {
                    var value = peak.value === null ? 0 : peak.value;
                    var point = [index, value];
                    chartPoints.push(point);
                });

                return chartPoints;
            },

            buildPeaksFlotDataSeries: function (chartPoints, chartColor)
            {
                var dataSeries =
                {
                    data: chartPoints,
                    color: "#FFFFFF",
                    lines:
                    {
                        fillColor: { colors: [chartColor.dark, chartColor.light] }
                    }
                };

                return [dataSeries];
            },

            buildFlotChartOptions: function()
            {
                var flotOptions = defaultFlotOptions.getSplineOptions(this.onHover);

                flotOptions.yaxis = {
                    min: this.calculateYAxisMinimum(),
                    tickFormatter: this.formatYAxisTick
                };

                flotOptions.xaxis = {
                    tickSize: 3,
                    tickDecimals: 0,
                    tickFormatter: this.formatXAxisTick,
                    tickLength: 0
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
                var peaksItem = this.peaks[flotItem.dataIndex];

                var tooltipData = this.toolTipBuilder(peaksItem, this.timeInZones);
                var tooltipHTML = tooltipTemplate(tooltipData);
                $tooltipEl.html(tooltipHTML);
                toolTipPositioner.updatePosition($tooltipEl, this.plot);
            },

            formatXAxisTick: function(value, series)
            {
                if (this.peaks[value])
                {
                    var label = this.peaks[value].label;
                    return label.replace(/ /g, "").replace(/Minutes/, "m").replace(/Seconds/, "s").replace(/Hour/, "h");
                } else
                {
                    return null;
                }
            },

            formatYAxisTick: function(value, series)
            {
                return value.toFixed(0);
            },

            calculateYAxisMinimum: function()
            {
                    for(var i = this.peaks.length - 1;i >= 0;i--)
                    {
                        if (this.peaks[i].value)
                        {
                            return this.peaks[i].value * 0.75;
                        }
                    }

                    return 0;
            }

        });

});