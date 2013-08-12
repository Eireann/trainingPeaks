﻿define(
[
    "underscore",
    "./dashboardChartBase",
    "TP",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.pie",
    "models/reporting/fitnessSummaryModel",
    "views/dashboard/fitnessSummaryChartSettings",
    "hbs!templates/views/dashboard/dashboardChart"
],
function(
    _,
    DashboardChartBase,
    TP,
    chartColors,
    defaultFlotOptions,
    flotPie,
    FitnessSummaryModel,
    FitnessSummaryChartSettings,
    defaultChartTemplate
    )
{

    var fitnessSummaryTypes = {
        1: { id: 1, label: "Planned Distance", dataKey: "distancePlanned"},
        2: { id: 2, label: "Completed Distance", dataKey: "distanceActual"},
        3: { id: 3, label: "Planned Duration", dataKey: "totalTimePlanned"},
        4: { id: 4, label: "Completed Duration", dataKey: "totalTimeActual"}
    };

    var FitnessSummaryChart = {

        className: DashboardChartBase.className + " fitnessSummaryChart",
        modelClass: FitnessSummaryModel,
        
        template:
        {
            type: "handlebars",
            template: defaultChartTemplate
        },

        setupViewModel: function(options)
        {
            this.model = new TP.Model();
            this.setChartTitle();
        },

        buildFlotPoints: function()
        {
            var chartPoints = [];

            if(this.chartDataModel.has("data"))
            {
                var data = this.chartDataModel.get("data");
                var dataKey = fitnessSummaryTypes[this.getSetting("summaryType")].dataKey;
                _.each(data, function(workoutTypeData)
                {
                    if(workoutTypeData.hasOwnProperty(dataKey) && workoutTypeData[dataKey] > 0)
                    {
                        var workoutTypeName = TP.utils.workout.types.getNameById(workoutTypeData.workoutTypeId);
                        var workoutTypeGradient = chartColors.gradients.workoutType[workoutTypeName.toLowerCase().replace(/[^a-z]/g,"")];
                        var chartPoint = {
                            label: workoutTypeName,
                            data: workoutTypeData[dataKey],
                            color: {
                                colors: [workoutTypeGradient.light, workoutTypeGradient.dark ]
                            }
                        };

                        chartPoints.push(chartPoint);
                    }
                });
            }
            /* 
            var chartPoints = [
                { label: "Run", data: 27, color: { colors: [ "rgb(190,110,110)", "rgb(60, 10, 10)" ] }},
                { label: "bike", data: 42, color: '#654321' },
                { label: "swim", data: 31, color: '#321654' }
            ];
            */

            return chartPoints;
        },

        buildFlotDataSeries: function (chartPoints)
        {
            // pie charts are different than other charts in how we structure the series data
            return chartPoints;
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            // pie plugin wants series settings here instead of in data series
            flotOptions.series = {
                pie: 
                {
                    show: true,
                    layerSlices: true,
                    startAngle: 0,
                    highlight: {
                        opacity: 0
                    }
                }
            };

            return flotOptions;
        },

        setDefaultSettings: function(options)
        {
            this.setDefaultDateSettings(options);
            var defaultSettings = {
                durationUnits: 4,
                summaryType: 1 // Planned Distance
            };
            var mergedSettings = _.extend(defaultSettings, this.settingsModel.get(this.settingsKey));
            this.settingsModel.set(this.settingsKey, mergedSettings, { silent: true });
        },

        createChartSettingsView: function()
        {
            return new FitnessSummaryChartSettings({ model: this.settingsModel, index: this.index, summaryTypes: fitnessSummaryTypes });
        },

        setChartTitle: function()
        {
            this.model.set("title", TP.utils.translate("Fitness Summary: ") + TP.utils.translate(fitnessSummaryTypes[this.getSetting("summaryType")].label));
        },

        listenToChartSettingsEvents: function()
        {
            this.settingsModel.on("change:" + this.settingsKey + ".summaryType", this.render, this);
        },

        stopListeningToChartSettingsEvents: function()
        {
            this.settingsModel.off("change:" + this.settingsKey + ".summaryType", this.render, this);
        }
    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, FitnessSummaryChart));

});
