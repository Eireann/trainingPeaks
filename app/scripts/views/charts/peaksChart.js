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

                if (!options.timeInZones)
                    throw "PeaksChartView requires a timeInZones object at construction time";

                if (!options.chartColor)
                    throw "PeaksChartView requires a chartColor object at construction time";

                if (!options.graphTitle)
                    throw "PeaksChartView requires a graphTitle string at construction time";

                if (!options.toolTipBuilder)
                    throw "PeaksChartView requires a toolTipBuilder callback at construction time";

                this.peaks = options.peaks;
                this.timeInZones = options.timeInZones;
                this.chartColor = options.chartColor;
                this.graphTitle = options.graphTitle;

                _.bindAll(this, "onHover", "formatXAxisTick", "formatYAxisTick");
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

                _.each(peaks, function(peak, index)
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
                    color: "#FFFFFF",
                    lines:
                    {
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
                    tickFormatter: this.formatYAxisTick
                };

                flotOptions.xaxis = {
                    tickSize: 3,
                    tickDecimals: 0,
                    tickFormatter: this.formatXAxisTick
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
                return value;
            }
        });

});