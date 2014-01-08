define(
[
    "underscore",
    "TP",
    "framework/chart",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "dashboard/views/fitnessSummaryChartSettings"
],
function(
    _,
    TP,
    Chart,
    chartColors,
    defaultFlotOptions,
    DashboardChartUtils,
    FitnessSummaryChartSettingsView
)
{

    var FitnessSummaryChart = Chart.extend({
        
        summaryTypes: {
            1: { id: 1, label: "Planned Distance", dataKey: "distancePlanned"},
            2: { id: 2, label: "Completed Distance", dataKey: "distanceActual"},
            3: { id: 3, label: "Planned Duration", dataKey: "totalTimePlanned"},
            4: { id: 4, label: "Completed Duration", dataKey: "totalTimeActual"}
        },

        settingsView: FitnessSummaryChartSettingsView,

        defaults: {
            durationUnits: 4,
            summaryType: 1 // Planned Distance
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            return this.dataManager.fetchReport("fitnesssummary", dateOptions.startDate, dateOptions.endDate);
        },

        buildTooltipData: function(flotItem)
        {
            var tips = [];
            //flotItem.series.raw.fullData
            var data = flotItem.series.raw.fullData;

            var workoutTypeName = TP.utils.workout.types.getNameById(data.workoutTypeId);
            tips.push({ label: workoutTypeName, value: TP.utils.conversion.formatUnitsValue("%", flotItem.series.percent)  + "%"});

            if(data.distancePlanned)
            {
                tips.push({ label: "Planned distance", value: TP.utils.conversion.formatUnitsValue("distance", data.distancePlanned, { workoutTypeId: data.workoutTypeId, defaultValue: "--" }) +
                    " " + TP.utils.units.getUnitsLabel("distance", data.workoutTypeId) });
            }

            tips.push({ label: "Completed distance", value: TP.utils.conversion.formatUnitsValue("distance", data.distanceActual, { workoutTypeId: data.workoutTypeId, defaultValue: "--" }) +
                    " " + TP.utils.units.getUnitsLabel("distance", data.workoutTypeId) });

            if(data.totalTimePlanned)
            {
                tips.push({ label: "Planned duration", value: TP.utils.conversion.formatUnitsValue("duration", data.totalTimePlanned, { workoutTypeId: data.workoutTypeId, defaultValue: "--", max: 999999 }) });
            }

            tips.push({ label: "Completed duration", value: TP.utils.conversion.formatUnitsValue("duration", data.totalTimeActual, { workoutTypeId: data.workoutTypeId, defaultValue: "--", max: 999999 }) });           

            tips.push({ label: "TSS", value: TP.utils.conversion.formatUnitsValue("tss", data.totalTSSActual, { defaultValue: "--", max: 999999 }) });
            return tips;
        },

        defaultTitle: function()
        {
            return TP.utils.translate("Fitness Summary: ") + TP.utils.translate(this.summaryTypes[this.get("summaryType")].label);
        },

        parseData: function(data)
        {
            var chartPoints = this._buildFlotPoints(data);

            if(chartPoints.length)
            { 
                return {
                    dataSeries: chartPoints,
                    flotOptions: this._buildFlotChartOptions()
                };
            }
            else
            {
                return null;
            }
        },

        getChartName: function()
        {
            return "Fitness Summary Chart";
        },

        _buildFlotPoints: function(data)
        {
            var chartPoints = [];

            var dataKey = this.summaryTypes[this.get("summaryType")].dataKey;
            _.each(data, function(workoutTypeData)
            {
                if(workoutTypeData.hasOwnProperty(dataKey) && workoutTypeData[dataKey] > 0)
                {
                    var workoutTypeName = TP.utils.workout.types.getNameById(workoutTypeData.workoutTypeId);
                    var workoutTypeShortName = TP.utils.workout.types.getShortNameById(workoutTypeData.workoutTypeId);
                    var workoutTypeGradient = chartColors.gradients.workoutType[workoutTypeName.toLowerCase().replace(/[^a-z]/g,"")];
                    var chartPoint = {
                        label: workoutTypeShortName,
                        data: workoutTypeData[dataKey],
                        color: {
                            stroke: "#eaebec",
                            colors: [workoutTypeGradient.light, workoutTypeGradient.dark ]
                        },
                        fullData: workoutTypeData
                    };
                    if (chartPoint.data < 5)
                    {

                    }
                    chartPoints.push(chartPoint);
                }
            });

            return chartPoints;
        },

        _buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions();

            // pie plugin wants series settings here instead of in data series
            flotOptions.series = {
                pie: 
                {
                    show: true,
                    radius: 1,
                    layerSlices: true,
                    startAngle: 0,
                    highlight: {
                        opacity: 0
                    },
                    
                    label: 
                    {
                        show: true,
                        radius: 0.7,
                        formatter: function (label, series)
                        {
                            return '<div class="fitnessSummartChart">' + label + '<br/>' + TP.utils.conversion.formatUnitsValue("%", series.percent) + '%</div>';
                        },
                        background: { opacity: 0.5 },
                        threshold: 0.05
                    }
                }
                
            };
            return flotOptions;
        }

    });

    return FitnessSummaryChart;

});
