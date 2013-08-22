define(
[
    "underscore",
    "moment",
    "flot/jquery.flot.time",
    "TP",
    "framework/chart",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "views/dashboard/chartUtils",
    "dashboard/views/MetricsChartSettingsView",
    "shared/data/metricTypes"
],
function(
    _,
    moment,
    flotTime, // Ensure jquery.flot.time is loaded
    TP,
    Chart,
    defaultFlotOptions,
    chartColors,
    DashboardChartUtils,
    MetricsChartSettingsView,
    metricTypes
)
{
    var MetricsChart = Chart.extend({

        settingsView: MetricsChartSettingsView,

        metricTypes: metricTypes,

        defaults: {
            showMarkers: false,
            dataFields: []
        },

        initialize: function(attributes, options)
        {
        },

        getChartName: function()
        {
            return "Metrics Chart";
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions") || {});
            return this.dataManager.fetchMetrics(dateOptions.startDate, dateOptions.endDate);
        },

        parseData: function(data)
        {
            _.each(data, function(entry)
            {
                entry.date = moment(entry.timeStamp).valueOf();
                entry.detailsByType = {};

                _.each(entry.details, function(detail)
                {
                    entry.detailsByType[detail.type] = detail;
                });
            });

            var yaxes = [], series = [];
            _.each(this.get("dataFields"), function(metricTypeId)
            {
                var metricInfo = this._getMetricInfo(metricTypeId);
                if (!metricInfo) return;

                yaxes.push(this._createAxis(metricInfo));
                if (metricInfo.subMetrics)
                {
                    _.each(metricInfo.subMetrics, function(subMetricInfo)
                    {
                        var seriesInfo = _.extend({ original: metricInfo }, metricInfo, subMetricInfo);
                        series.push(this._makeSeries(data, seriesInfo, { yaxis: yaxes.length }));
                    }, this);
                }
                else
                {
                    series.push(this._makeSeries(data, metricInfo, {yaxis: yaxes.length }));
                }
            }, this);

            if (yaxes.length >= 2)
            {
                yaxes[1].position = 'right';
            }

            var hasNoData = _.all(series, function(series)
            {
                return series.data.length <= 0;
            });

            if(hasNoData) return null;
            
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions") || {});
            return {
                dataSeries: series,
                flotOptions: _.defaults({
                    legend: { show: true },
                    xaxis:
                    {
                        min: moment(dateOptions.startDate).valueOf(),
                        max: moment(dateOptions.endDate).valueOf(),
                        ticks: function(axis)
                        {
                            var date = moment(axis.min).startOf('day');
                            var delta = moment.duration(Math.ceil(moment.duration(axis.delta * 1.3).asDays()), "days");

                            var ticks = [date.valueOf()];

                            while(_.last(ticks) < axis.max)
                            {
                                date.add(delta);
                                ticks.push(date.valueOf());
                            }

                            return ticks;
                        },
                        tickFormatter: function(date)
                        {
                            return moment(date).format("L");
                        }
                    },
                    yaxes: yaxes,
                    points:
                    {
                        show: this.get("showMarkers")
                    },
                    lines:
                    {
                        fill: false
                    }
                }, defaultFlotOptions.getSplineOptions(null))

            };
        },

        _makeSeries: function(data, metricInfo, options)
        {
            var raw = [], points = [];
            _.each(data, function(entry)
            {
                var details = entry.detailsByType[metricInfo.id];
                var xvalue = entry.date;
                var yvalue = details && details.value;

                if(yvalue && metricInfo.index !== undefined)
                {
                    yvalue = yvalue[metricInfo.index];
                }

                if(yvalue)
                {
                    raw.push(details);
                    points.push([xvalue, yvalue]);
                }
            }, this);

            return _.extend({
                label: metricInfo.label,
                data: points,
                raw: raw,
                info: metricInfo
            }, options);
        },

        _createAxis: function(metricInfo)
        {
            var self = this;

            if (metricInfo.enumeration)
            {
                return {
                    ticks: _.pluck(metricInfo.enumeration, "value"),
                    tickFormatter: function(value)
                    {
                        return self._formatValue(value, metricInfo);
                    }
                };
            }
            else if(metricInfo.units)
            {
                return {
                    label: TP.utils.units.getUnitsLabel(metricInfo.units),
                    tickFormatter: function(value)
                    {
                        return self._formatValue(value, metricInfo);
                    }
                };
            }
            else
            {
                return {};
            }
        },

        _getMetricInfo: function(metricTypeId)
        {
            metricTypeId = _.isString(metricTypeId) ? parseInt(metricTypeId, 10) : metricTypeId;
            return _.find(this.metricTypes, function(type) { return type.id === metricTypeId; });
        },

        buildTooltipData: function(flotItem)
        {
            var metricInfo = this._getOriginalInfo(flotItem.series.info);
            var details = flotItem.series.raw[flotItem.dataIndex];
            var formattedValue = this._formatValue(details.value, metricInfo);
            if(metricInfo.units)
            {
                formattedValue += " " + TP.utils.units.getUnitsLabel(metricInfo.units);
            }
            return [
                { label: flotItem.series.info.label },
                { value: moment(details.date).format("L LT") },
                { value: formattedValue }
            ];
        },


        updateChartTitle: function()
        {
            this.set("title", TP.utils.translate("Metrics"));
        },

        _formatValue: function(value, metricInfo)
        {
            if (metricInfo.enumeration)
            {
                var option = _.find(metricInfo.enumeration, function(option)
                {
                    return option.value === value;
                });

                return option && option.label;
            }
            else if(metricInfo.units)
            {
                return TP.utils.conversion.formatUnitsValue(metricInfo.units, value);
            }
            else
            {
                return value;
            }
        },

        _getOriginalInfo: function(info)
        {
            return info.original || info;
        }
    });

    return MetricsChart;
});

