define(
[
    "underscore",
    "./dashboardChartBase",
    "TP",
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
    defaultFlotOptions,
    flotPie,
    FitnessSummaryModel,
    FitnessSummaryChartSettings,
    defaultChartTemplate
    )
{
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
            this.model = new TP.Model({
                title: options.title
            });
        },

        buildFlotPoints: function()
        {
            var chartPoints = [
                { label: "Run", data: 27, color: '#123456' },
                { label: "bike", data: 42, color: '#654321' },
                { label: "swim", data: 31, color: '#321654' }
            ];

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
                    startAngle: 0
                }
            };

            return flotOptions;
        },

        setDefaultSettings: function(options)
        {
            this.setDefaultDateSettings(options);
            var defaultSettings = {
                durationUnits: 4,
                summaryType: 1 // FIXME to use enum
            };
            var mergedSettings = _.extend(defaultSettings, this.settingsModel.get(this.settingsKey));
            this.settingsModel.set(this.settingsKey, mergedSettings, { silent: true });
        },

        createChartSettingsView: function()
        {
            return new FitnessSummaryChartSettings({ model: this.settingsModel, index: this.index });
        },

        setChartTitle: function()
        {
            this.model.set("title", TP.utils.translate("Fitness Summary"));
        }
        
    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, FitnessSummaryChart));

});
