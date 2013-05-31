define(
[
    "TP",
    "hbs!templates/views/quickView/zonesTab/chartTooltip"
],
function (TP, tooltipTemplate)
{
    return TP.ItemView.extend(
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
            
            if (!options.timeInZones)
                throw "PeaksChartView requires a timeInZones object at construction time";

            if (!options.chartColor)
                throw "PeaksChartView requires a chartColor object at construction time";

            if (!options.graphTitle)
                throw "PeaksChartView requires a graphTitle string at construction time";

            if (!options.chartModifier)
                throw "PeaksChartView requires a chartModifier callback at construction time";

            if (!options.toolTipBuilder)
                throw "PeaksChartView requires a toolTipBuilder callback at construction time";

            this.peaks = options.peaks;
            this.timeInZones = options.timeInZones;
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
                TP.utils.chartBuilder.renderSplineChart(this.$chartEl, chartPoints, tooltipTemplate, chartOptions);
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
        }
    });
});