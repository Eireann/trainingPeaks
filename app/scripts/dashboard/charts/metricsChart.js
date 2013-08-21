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
            dataFields: [1, 9]
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
                metricTypeId = _.isString(metricTypeId) ? parseInt(metricTypeId, 10) : metricTypeId;
                var metricInfo = _.find(this.metricTypes, function(type) { return type.id === metricTypeId; });
                if (!metricInfo) return;

                yaxes.push({});
                if (metricInfo.subMetrics)
                {
                    _.each(metricInfo.subMetrics, function(subMetricInfo)
                    {
                        var seriesInfo = _.extend({}, metricInfo, subMetricInfo);
                        series.push(this._makeSeries(data, seriesInfo, { yaxis: yaxes.length }));
                    }, this);
                }
                else
                {
                    series.push(this._makeSeries(data, metricInfo, {yaxis: yaxes.length }));
                }
            }, this);

            console.log(yaxes);

            return {
                dataSeries: series,
                flotOptions: _.defaults({
                    legend: { show: true },
                    xaxis:
                    {
                        mode: "time",
                        timeformat: "%m/%d/%Y"
                    },
                    yaxes: yaxes,
                    points: {
                        show: this.get("showMarkers")
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

        buildTooltipData: function(flotItem)
        {
            // var peak = flotItem.series.raw[flotItem.dataIndex];
            // return [
            //     { value: moment(peak.date).format("ddd, L") },
            //     { value: peak.title },
            //     { value: this._formatPeakValue(peak.value) }
            // ];
        },


        updateChartTitle: function()
        {
            this.set("title", TP.utils.translate("Metrics"));
        }
    });

    return MetricsChart;
});

