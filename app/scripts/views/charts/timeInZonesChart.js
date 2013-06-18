define(
[
    "underscore",
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.tooltip",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/quickView/zonesTab/timeInZonesChart",
    "hbs!templates/views/quickView/zonesTab/chartTooltip"
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

                    _.bindAll(this, "onHover");
                },

                buildTimeInZonesFlotPoints: function(timeInZones)
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
                    var dataSeries =
                    {
                        data: chartPoints,
                        bars:
                        {
                            show: true,
                            lineWidth: 0,
                            fill: true,
                            fillColor: { colors: [this.chartColor.light, this.chartColor.dark] }
                        },
                        highlightColor: this.chartColor.light
                    };

                    return dataSeries;
                },

                getFlotChartOptions: function(chartPoints)
                {
                    var flotOptions = defaultFlotOptions.getBarOptions(this.onHover);

                    flotOptions.yaxis = {
                        min: 0,
                        ticks: 6,
                        tickDecimal: 0
                    };


                    flotOptions.xaxis = {
                        show: false
                    };

                    return flotOptions;
                },

                renderTimeInZonesFlotChart: function(dataSeries, flotOptions)
                {

                    if (!this.$chartEl)
                        this.$chartEl = this.$(".chartContainer");

                    this.plot = $.plot(this.$chartEl, dataSeries, flotOptions);
                },

                onHover: function(flotItem, $tooltipEl)
                {
                    var timeInZonesItem = this.timeInZones.timeInZones[flotItem.dataIndex];

                    var tooltipData = this.toolTipBuilder(timeInZonesItem, this.timeInZones);
                    var tooltipHTML = tooltipTemplate(tooltipData);
                    $tooltipEl.html(tooltipHTML);
                    toolTipPositioner.updatePosition($tooltipEl, this.plot);
                },

                onRender: function()
                {
                    if (!this.timeInZones)
                        return;

                    var chartPoints = this.buildTimeInZonesFlotPoints(this.timeInZones);
                    var dataSeries = this.buildTimeInZonesFlotDataSeries(chartPoints);
                    var flotOptions = this.getFlotChartOptions(chartPoints);

                    var self = this;

                    // let the html draw first so our container has a height and width
                    setImmediate(function()
                    {
                        self.renderTimeInZonesFlotChart([dataSeries], flotOptions);
                    });
                }

            });
    });
