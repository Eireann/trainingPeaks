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
    "shared/data/metricTypes",
    "shared/models/metricsCollection"
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
    metricTypes,
    MetricsCollection
)
{
    var MetricsChart = Chart.extend({

        settingsView: MetricsChartSettingsView,

        metricTypes: metricTypes,

        defaults: {
            showMarkers: true
        },

        initialize: function(attributes, options)
        {
            if (!this.has("dataFields"))
            {
                this.set("dataFields", [9, 4]);
            }
        },

        getChartName: function()
        {
            return "Metrics Chart";
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions") || {});
            var promise = this.dataManager.loadCollection(MetricsCollection, _.pick(dateOptions, "startDate", "endDate"));
            this.metrics = promise.collection;
            return promise;
        },

        parseData: function()
        {
            var self = this;

            var data = this.metrics.toJSON();
            _.each(data, function(entry)
            {
                entry.date = moment(entry.timeStamp).valueOf();
                entry.detailsByType = {};

                _.each(entry.details, function(detail)
                {
                    entry.detailsByType[detail.type] = detail;
                });
            });

            var yaxes = [], series = [], yaxesIndexByUnit = {}, yaxesIndex;
            _.each(this.get("dataFields"), function(metricTypeId)
            {
                var metricInfo = this._getMetricInfo(metricTypeId);
                if (!metricInfo) return;

                // Generate an axis for this metric if id doesn't have
                // particular units or if we don't have an axis for those units
                // yet, otherwise lookup the index of the existing axis with
                // those units
                if (!metricInfo.units || !yaxesIndexByUnit[metricInfo.units])
                {
                    yaxes.push(this._createAxis(metricInfo));
                    yaxesIndex = yaxes.length; // flot uses 1 based indices for axes...
                    if(metricInfo.units)
                    {
                        yaxesIndexByUnit[metricInfo.units] = yaxes.length;
                    }
                }
                else
                {
                    yaxesIndex = yaxesIndexByUnit[metricInfo.units];
                }

                this._eachSubMetricInfo(metricInfo, function subMetricInfoFunction(subMetricInfo) {
                    series.push(self._makeSeries(data, subMetricInfo, { yaxis: yaxesIndex }));
                });
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
                        min: dateOptions.startDate.valueOf(),
                        max: dateOptions.endDate.valueOf(),
                        ticks: function(axis)
                        {
                            var date = moment.local(axis.min).startOf('day');
                            var delta = Math.ceil(moment.duration(axis.delta * 1.3).asDays());

                            var ticks = [date.valueOf()];

                            while(_.last(ticks) < axis.max)
                            {
                                date.add(delta, "days");
                                ticks.push(date.valueOf());
                            }

                            return ticks;
                        },
                        tickFormatter: function(date)
                        {
                            return TP.utils.datetime.format(date);
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
            var raw = [], entries = [], points = [];
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
                    entries.push(entry);
                    points.push([xvalue, yvalue]);
                }
            }, this);

            return _.extend({
                label: metricInfo.label,
                data: points,
                raw: raw,
                entries: entries,
                info: metricInfo,
                shadowSize: 0,
                lines: {
                    lineWidth: 2
                }
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
            var self = this;
            var entry = flotItem.series.entries[flotItem.dataIndex];
            var tooltip = [{ value: TP.utils.datetime.format(entry.date, "ddd, L LT") }];

            _.each(this.get("dataFields"), function(metricTypeId)
            {
                var metricInfo = this._getMetricInfo(metricTypeId);
                var details = entry.detailsByType[metricInfo && metricInfo.id];

                if(!details) return;

                this._eachSubMetricInfo(metricInfo, function(subMetricInfo) {
                    var value = subMetricInfo.index >= 0 ? details.value[subMetricInfo.index] : details.value;

                    tooltip.push({
                        label: subMetricInfo.label,
                        value: self._formatValue(value, subMetricInfo, { displayUnits: true })
                    });

                });


            }, this);

            return tooltip;
        },

        defaultTitle: function()
        {
            return TP.utils.translate("Metrics");
        },

        _formatValue: function(value, metricInfo, options)
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
                var formattedValue = TP.utils.conversion.formatUnitsValue(metricInfo.units, value);
                if(options && options.displayUnits)
                {
                    formattedValue += " " + TP.utils.units.getUnitsLabel(metricInfo.units);
                }
                return formattedValue;
            }
            else
            {
                return value;
            }
        },

        _getOriginalInfo: function(info)
        {
            return info.original || info;
        },

        _eachSubMetricInfo: function(metricInfo, callback)
        {
            if (metricInfo && metricInfo.subMetrics)
            {
                _.each(metricInfo.subMetrics, function(subMetricInfo)
                {
                    return callback(_.extend({ original: metricInfo }, metricInfo, subMetricInfo));
                });
            }
            else
            {
                return callback(metricInfo);
            }
        }

    });

    return MetricsChart;
});

