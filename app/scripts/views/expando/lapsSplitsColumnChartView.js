define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
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

        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
            this.detailDataPromise = options.detailDataPromise;
            this.stateModel = options.stateModel;

            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            
            this.collection = this.model.get('detailData').getRangeCollectionFor("laps");
            this.collection.availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            this.listenTo(this.model, "reset change", _.bind(this.render, this));
            this.listenTo(this.model.get("detailData"), "reset change:availableDataChannels", _.bind(this.render, this));
        },

        onRender: function()
        {
            this.$el.toggleClass("noData", !this.collection.length);
            setImmediate(_.bind(this._renderChart, this));
        },

        _renderChart: function()
        {
            var self = this;
            var columnNames = [
                "lap",
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
            ];

            var activeNames = [
                "distance",
                "averageSpeed"
            ];

            this.lapsStats = new LapsStats({ model: this.model, columns: columnNames });

            var columns = this.columns = this.lapsStats.processColumns({ format: false });
            this.rows = this.lapsStats.processRows({ format: { withLabel: true } });

            var series = _.map(_.rest(columns, 1), function(column, i)
            {
                var color = chartColors.seriesColorByChannel[column.meta.channel] || chartColors.seriesColorByUnit[column.meta.units];

                var series = {
                    active: _.contains(activeNames, column.meta.id),
                    activeColor: color,
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
            var series = flotItem.series;

            series.active = !series.active;
            this._updateSeries(series);

            this.plot.draw();
        },

        _updateSeries: function(series)
        {
            if(series.active || series.hovered)
            {
                series.color = series.activeColor;

            }
            else
            {
                series.color = "#ccc";
            }

            if(series.bars)
            {
                var c = $.color.parse(series.color);
                c.a = series.active ? 1 : 0.6;
                series.bars.fillColor = c.toString();
            }
        }

    });

    return LapsSplitsColumnChartView;
});
