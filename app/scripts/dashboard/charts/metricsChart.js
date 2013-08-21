define(
[
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "views/dashboard/chartUtils",
    "dashboard/views/ChartSettingsView"
],
function(
    _,
    moment,
    TP,
    Chart,
    defaultFlotOptions,
    chartColors,
    DashboardChartUtils,
    ChartSettingsView
)
{
    var MetricsChart = Chart.extend({

        settingsView: ChartSettingsView,

        defulats: {
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
            console.log(data);

            var series = _.map(this.get("dataFields"), function(metricTypeId)
            {

            }, this);

            return {
                dataSeries: series,
                flotOptions: _.defaults({
                    legend: { show: true },
                }, defaultFlotOptions.getSplineOptions(null))

            };
        },

        buildTooltipData: function(flotItem)
        {
            var peak = flotItem.series.raw[flotItem.dataIndex];
            return [
                { value: moment(peak.date).format("ddd, L") },
                { value: peak.title },
                { value: this._formatPeakValue(peak.value) }
            ];
        },


        updateChartTitle: function()
        {
            this.set("title", TP.utils.translate("Metrics"));
        }
    });

    return MetricsChart;
});

