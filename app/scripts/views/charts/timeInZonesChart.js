define(
[
    "underscore",
    "setImmediate",
    "TP",
    "utilities/data/timeInZonesGenerator",
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
    timeInZonesGenerator,
    defaultFlotOptions,
    flotToolTip,
    toolTipPositioner,
    timeInZonesChartTemplate,
    tooltipTemplate
    )
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

        modelEvents: {},

        initialize: function(options)
        {
            if(!this.model)
                throw new Error("TimeInZonesChartView requires a model");

            if (!options.chartColor)
                throw new Error("TimeInZonesChartView requires a chartColor object at construction time");

            if (!options.toolTipBuilder)
                throw new Error("TimeInZonesChartView requires a toolTipBuilder callback at construction time");
             
            this.chartColor = options.chartColor;
            this.toolTipBuilder = options.toolTipBuilder;

            _.bindAll(this, "onHover");

            this.once("render", function()
            {
                this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this.renderIfVisible, this));
                this.listenTo(this.model.get("details"), "change:timeIn" + this.dataChannel + "Zones", _.bind(this.renderIfVisible, this));
                this.listenTo(this.model.get("details"), "change:timeIn" + this.dataChannel + "Zones.*", _.bind(this.renderIfVisible, this));
                this.listenTo(this.model.get("details"), "change:timeIn" + this.dataChannel + "Zones.timeInZones.*", _.bind(this.renderIfVisible, this));
            }, this);
        },

        serializeData: function()
        {
            return this.chartModel.toJSON();
        },               

        onRender: function()
        {
            if(this.model.get("detailData").channelWasCut(this.dataChannel))
            {
                this.$el.addClass("noData");
                return;
            }

            this.timeInZones = timeInZonesGenerator(this.dataChannel, this._getZoneSettingName(), this.model.get("details"), this.model);
        
            if(!this._hasTimeInAnyZone())
            {
                this.$el.addClass("noData");
                return;
            }

            this.$el.removeClass("noData");
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

            if(!this.$chartEl.is(":visible"))
            {
                return;
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
        },

        _getZoneSettingName: function()
        {
            return this.dataChannel.substring(0,1).toLowerCase() + this.dataChannel.substring(1) + "Zones";
        },

        _hasTimeInAnyZone: function()
        {
            if(!this.timeInZones || !this.timeInZones.timeInZones)
            {
                return false;
            }

            var foundZoneWithTime = _.find(this.timeInZones.timeInZones, function(tiz)
            {
                return tiz.seconds > 0;
            });

            return foundZoneWithTime ? true : false;
        }
        
    });
});
