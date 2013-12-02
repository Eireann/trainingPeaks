define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "views/expando/lapsSplitsColumnChartSettingsView",
    "utilities/lapsStats",
    "utilities/charting/flotOptions",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/charts/chartTooltip",
    "hbs!templates/views/expando/lapsSplitsColumnChart",
    "shared/utilities/chartingAxesBuilder",
    "utilities/charting/chartColors"
],
function(
    $,
    _,
    setImmediate,
    TP,
    LapsSplitsColumnChartSettingsView,
    LapsStats,
    defaultFlotOptions,
    toolTipPositioner,
    tooltipTemplate,
    lapsColumnChartTemplate,
    ChartingAxesBuilder,
    chartColors
)
{


    var LapsSplitsColumnChartView = TP.ItemView.extend(
    {
        className: "expandoLapsSplitsColumnChartPod",
        events:
        {
            "change input": "handleChange",
            "plotclick .chartContainer": "_onPlotClick",
            "plothover .chartContainer": "_onPlotHover"
        },

        template: lapsColumnChartTemplate,

        settingsView: LapsSplitsColumnChartSettingsView.Tomahawk,

        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
            if (!options.podModel)
            {
                throw "PodModel is required for LapsSplitsView";
            }
            this.podModel = options.podModel;
            this.detailDataPromise = options.detailDataPromise;
            this.stateModel = options.stateModel;

            if(!this.podModel.has("columns"))
            {
                this.podModel.set("columns", LapsStats.getColumnIds([
                    "duration",
                    "movingTime",
                    "distance",
                    "averageCadence",
                    "maximumSpeed",
                    "averageSpeed",
                    "maximumPower",
                    "averagePower",
                    "minimumHeartRate",
                    "maximumHeartRate",
                    "averageHeartRate",
                    "elevationGain",
                    "elevationLoss",
                    "calories"
                ]));
            }

            this.active = [4, 5, 6];

            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            
            this.collection = this.model.get('detailData').getRangeCollectionFor("laps");
            this.collection.availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            this.listenTo(this.model, "reset change", _.bind(this.render, this));
            this.listenTo(this.model.get("detailData"), "reset change:availableDataChannels", _.bind(this.render, this));

            this.listenTo(this.podModel, "change", _.bind(this._renderChart, this));
        },

        onRender: function()
        {
            this.$el.toggleClass("noData", !this.collection.length);
            setImmediate(_.bind(this._renderChart, this));
        },

        _renderChart: function()
        {
            var self = this;
            var columnIds = [1].concat(_.sortBy(this.podModel.get("columns")));

            this.lapsStats = new LapsStats({ model: this.model, columns: columnIds });

            var columns = this.columns = this.lapsStats.processColumns({ format: false });
            this.rows = this.lapsStats.processRows({ format: { withLabel: true } });

            var series = _.map(_.rest(columns, 1), function(column, i)
            {
                var color = chartColors.seriesColorByChannel[column.meta.channel] ||
                            chartColors.seriesColorByUnit[column.meta.units];

                var altColor;

                if(/minimum/i.test(column.meta.name))
                {
                    altColor = chartColors.seriesDarkColorByChannel[column.meta.channel];
                }
                else if(/maximum|moving|gain/i.test(column.meta.name))
                {
                    altColor = chartColors.seriesLightColorByChannel[column.meta.channel];
                }

                altColor = altColor || color;


                var series = {
                    meta: column.meta,
                    active: _.contains(self.active, column.meta.id),
                    activeColor: altColor,
                    ghostColor: i % 2 === 0 ? "#ccc" : "#bbb",
                    bars: {
                        order: i,
                        fill: 1
                    },
                    units: column.meta.units,
                    data: _.map(column.data, function(item, i) { return [i, item]; }),
                    yaxisExtraInfo: { font: { color: color } }
                };

                self._updateSeries(series);

                return series;
            });

            var flotOptions = _.defaults({
                bars:
                {
                    show: true,
                    barWidth: 0.8 / (columns.length - 1),
                    lineWidth: 0.00000001 // 0 causes flot.orderBars to default to 2 for calculations... which aren't redone on resize.
                },
                shadowSize: 0,
                yaxes: ChartingAxesBuilder.makeYaxes(series, { maxRight: Infinity }),
                xaxis:
                {
                    ticks: _.map(columns[0].data, function(lap, i) { return [i, lap]; }),
                    color: "transparent"
                }

            }, defaultFlotOptions.getBarOptions(null));

            flotOptions.tooltipOpts.onHover = _.bind(this._onHoverToolTip, this);

            this.plot = $.plot(this.$el.find(".chartContainer"), series, flotOptions);
        },

        _buildTooltipData: function(flotItem)
        {
            var self = this;

            var series = flotItem.series;
            var data = _.zip(this.lapsStats.getHeaders(), this.rows[flotItem.dataIndex], [{}].concat(this.plot.getData()));

            var entries = _.map(data, function(cell, i) {
                cell = _.object(['header', 'value', 'series'], cell);

                cell.series.hovered = i === flotItem.seriesIndex + 1;
                self._updateSeries(cell.series);
                var entry =
                {
                    label: cell.header,
                    value: cell.value,
                    color: cell.series.hovered ? flotItem.series.activeColor : null
                };
                return cell.series.hovered || cell.series.active ? entry : null;
            });

            this.plot.draw();
            return _.compact(entries);
        },

        _onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this._buildTooltipData(flotItem) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
            this.$currentToolTip = $tooltipEl;
        },

        _onPlotHover: function(event, position, flotItem)
        {
            var self = this;

            _.each(this.plot.getData(), function(series, index)
            {
                series.hovered = flotItem && flotItem.seriesIndex === index;
                self._updateSeries(series);
            });

            this.plot.draw();
        },

        _onPlotClick: function(event, position, flotItem)
        {
            if(!flotItem || !flotItem.series) return;

            var series = flotItem.series;

            series.active = !series.active;

            if(series.active)
            {
                this.active = _.uniq(this.active.concat([series.meta.id]));
            }
            else
            {
                this.active = _.without(this.active, series.meta.id);
            }

            this._updateSeries(series);

            this.plot.draw();
        },

        _updateSeries: function(series)
        {
            var c;
            if(series.active || series.hovered)
            {
                series.color = series.activeColor;

            }
            else
            {
                series.color = series.ghostColor;
            }

            if(series.bars)
            {
                c = $.color.parse(series.color);
                c = c.scale('a', series.active ? 1 : 0.6);
                series.bars.fillColor = c.toString();
            }
        }

    });

    return LapsSplitsColumnChartView;
});
