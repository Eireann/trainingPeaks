define(
[
    "underscore",
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.tooltip",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/charts/timeInZonesChart",
    "hbs!templates/views/charts/chartTooltip"
],
    function (
        _,
        setImmediate,
        TP,
        defaultFlotOptions,
        flotToolTip,
        toolTipPositioner,
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

                initialize: function(options)
                {
                    if (!options.timeInZones)
                        throw "TimeInZonesChartView requires a timeInZones object at construction time";

                    if (!options.chartColor)
                        throw "TimeInZonesChartView requires a chartColor object at construction time";

                    if (!options.toolTipBuilder)
                        throw "TimeInZonesChartView requires a toolTipBuilder callback at construction time";

                    this.timeInZones = options.timeInZones;
                    this.chartColor = options.chartColor;
                    this.toolTipBuilder = options.toolTipBuilder;

                    _.bindAll(this, "onHover");
                },
                
                
                onRender: function()
                {
                    if (!this.timeInZones)
                        return;

                    var chartPoints = this.buildTimeInZonesFlotPoints(this.timeInZones);
                    var dataSeries = this.buildTimeInZonesFlotDataSeries(chartPoints, this.chartColor);
                    var flotOptions = this.buildTimeInZonesFlotChartOptions();

                    var self = this;

                    // let the html draw first so our container has a height and width
                    setImmediate(function()
                    {
                        self.renderTimeInZonesFlotChart(dataSeries, flotOptions);
                    });
                },

                buildTimeInZonesFlotPoints: function(timeInZones)
                {
                    var chartPoints = [];

                    _.each(timeInZones.timeInZones, function (timeInZone, index)
                    {
                        if(timeInZone)
                        {
                            var minutes = timeInZone.seconds ? parseInt(timeInZone.seconds, 10) / 60 : null;
                            var point = [index, minutes];
                            chartPoints.push(point);
                        } else {
                            chartPoints.push(index, null);
                        }
                    }, this);

                    return chartPoints;
                },

                buildTimeInZonesFlotDataSeries: function (chartPoints, chartColor)
                {
                    var dataSeries =
                    {
                        data: chartPoints,
                        bars:
                        {
                            show: true,
                            lineWidth: 0,
                            fill: true,
                            fillColor: { colors: [chartColor.light, chartColor.dark] }
                        },
                        highlightColor: chartColor.light
                    };

                    return [dataSeries];
                },

                buildTimeInZonesFlotChartOptions: function()
                {
                    var flotOptions = defaultFlotOptions.getBarOptions(this.onHover);

                    flotOptions.yaxis = {
                        min: 0,
                        tickDecimals: 0
                    };


                    flotOptions.xaxis = {
                        show: false
                    };

                    return flotOptions;
                },

                renderTimeInZonesFlotChart: function(dataSeries, flotOptions)
                {
                    this.$chartEl = this.$(".chartContainer");

                    if(!this.$chartEl.height())
                    {
                        this.$chartEl.css({ "min-height": 1, "min-width": 1 });
                    }

                    
                    if($.plot)
                    {
                        this.plot = $.plot(this.$chartEl, dataSeries, flotOptions);
                    }
                },

                onHover: function(flotItem, $tooltipEl)
                {
                    var timeInZonesItem = this.timeInZones.timeInZones[flotItem.dataIndex];

                    var tooltipData = this.toolTipBuilder(timeInZonesItem, this.timeInZones);
                    var tooltipHTML = tooltipTemplate(tooltipData);
                    $tooltipEl.html(tooltipHTML);
                    toolTipPositioner.updatePosition($tooltipEl, this.plot);
                }
            });
    });
