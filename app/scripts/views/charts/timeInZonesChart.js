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
                this.$chartEl = null;
            }
            else
                this.$chartEl = this.$el;
        },

        onRender: function()
        {
            if (!this.timeInZones)
                return;

            var chartPoints = this.buildTimeInZonesChartPoints(this.timeInZones);

            var chartOptions =
            {
                colors: [this.chartColor],
                title:
                {
                    text: this.graphTitle + " by Zones"
                },
                xAxis:
                {
                    title:
                    {
                        text: "ZONES"
                    }
                },
                yAxis:
                {
                    title:
                    {
                        text: "MINUTES"
                    }
                }
            };
            
            if (!this.$chartEl)
                this.$chartEl = this.$el.find("div.chartContainer");
            
            TP.utils.chartBuilder.renderColumnChart(this.$chartEl, chartPoints, tooltipTemplate, chartOptions);
        },

        buildTimeInZonesChartPoints: function(timeInZones)
        {
            var chartPoints = [];
            var totalSeconds = TP.utils.chartBuilder.calculateTotalTimeInZones(timeInZones);

            // zone times are in seconds, convert to minutes
            _.each(timeInZones.timeInZones, function(timeInZone, index)
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
        }
    });
});