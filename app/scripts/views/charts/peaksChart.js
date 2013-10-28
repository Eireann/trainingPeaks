define(
[
    "underscore",
    "setImmediate",
    "TP",
    "utilities/data/peaksGenerator",
    "utilities/data/timeInZonesGenerator",
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
    peaksGenerator,
    timeInZonesGenerator,
    defaultFlotOptions,
    flotToolTip,
    toolTipPositioner,
    peaksChartTemplate,
    tooltipTemplate
    )
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

        modelEvents: {},

        initialize: function(options)
        {
            if(!this.model)
                throw new Error("PeaksChartView requires a model");

            if (!options.chartColor)
                throw new Error("PeaksChartView requires a chartColor object at construction time");

            if (!options.toolTipBuilder)
                throw new Error("PeaksChartView requires a toolTipBuilder callback at construction time");

            this.chartColor = options.chartColor;

            _.bindAll(this, "onHover", "formatXAxisTick", "formatYAxisTick");

            this.once("render", function()
            {
                this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this.renderIfVisible, this));
                this.listenTo(this.model.get("details"), "change:meanMax" + this.dataChannel + "s", _.bind(this.renderIfVisible, this));
                this.listenTo(this.model.get("details"), "change:meanMax" + this.dataChannel + "s.meanMaxes.*", _.bind(this.renderIfVisible, this));
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

            this.peaks = peaksGenerator.generate(this.dataChannel, this.model.get("details"));

            if(!this._hasDataForAnyPeak())
            {
                this.$el.addClass("noData");
                return;
            }

            this.$el.removeClass("noData");
            this.timeInZones = timeInZonesGenerator(this.dataChannel, this._getZoneSettingName(), this.model.get("details"), this.model);
            var chartPoints = this.buildPeaksFlotPoints(this.peaks);
            var dataSeries = this.buildPeaksFlotDataSeries(chartPoints, this.chartColor);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderPeaksFlotChart(dataSeries, flotOptions);
            });
        },

        buildPeaksFlotPoints: function(peaks)
        {
            var chartPoints = [];

            _.each(peaks, function(peak, index)
            {
                var value = peak.value ? peak.value : null;
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
                    lineWidth: 2,
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

        renderPeaksFlotChart: function(dataSeries, flotOptions)
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
        },

        _getZoneSettingName: function()
        {
            return this.dataChannel.substring(0,1).toLowerCase() + this.dataChannel.substring(1) + "Zones";
        },

        _hasDataForAnyPeak: function()
        {
            if(!this.peaks)
            {
                return false;
            }

            var foundPeak  = _.find(this.peaks, function(peak)
            {
                return peak.value > 0;
            });

            return foundPeak ? true : false;
        }

    });

});
