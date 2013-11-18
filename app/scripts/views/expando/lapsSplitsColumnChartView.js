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
    ChartingAxesBuilder,
    chartColors
)
{

    var LapsSplitsColumnChartView = TP.ItemView.extend(
    {
        className: "expandoLapsSplitsColumnChartPod",
        events:
        {
            "change input": "handleChange"
        },

        template: _.template("<div class='plotContent'></div>"),

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
            this.lapsStats = new LapsStats({ model: this.model, columns: columnNames });

            var columns = this.columns = this.lapsStats.processColumns({ format: false });
            this.rows = this.lapsStats.processRows({ format: { withLabel: true } });

            var series = _.map(_.rest(columns, 1), function(column, i)
            {
                var color = chartColors.seriesColorByChannel[column.meta.channel] || chartColors.seriesColorByUnit[column.meta.units];
                return {
                    bars: {
                        order: i,
                        fill: 1
                    },
                    units: column.meta.units,
                    color: color,
                    data: _.map(column.data, function(item, i) { return [i, item]; }),
                    yaxisExtraInfo: { font: { color: color } }
                };
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

            this.plot = $.plot(this.$el.find(".plotContent"), series, flotOptions);
        },

        _buildTooltipData: function(flotItem)
        {
            var data = _.zip(this.lapsStats.getHeaders(), this.rows[flotItem.dataIndex]);

            return _.map(data, function(cell, i) {
                return {
                    label: cell[0],
                    value: cell[1],
                    color: i === flotItem.seriesIndex + 1 ? flotItem.series.color : null
                };
            });
        },

        _onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this._buildTooltipData(flotItem) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
            this.$currentToolTip = $tooltipEl;
        }

    });

    return LapsSplitsColumnChartView;
});
