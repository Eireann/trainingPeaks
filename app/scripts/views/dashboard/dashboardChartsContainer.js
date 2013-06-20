define(
[
    "underscore",
    "TP",
    "views/pageContainer/primaryContainerView",
    "views/dashboard/dashboardChart",
    "views/dashboard/pmcChart",
    "hbs!templates/views/dashboard/dashboardChartsContainer"
],
function(
    _,
    TP,
    PrimaryContainerView,
    DashboardChartView,
    PmcChartView,
    dashboardContainerTemplate
    )
{
    var DashboardView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardContainerTemplate
        },

        ui:
        {
            chartsContainer: "#chartsContainer"
        },

        initialize: function()
        {
            this.charts = [];
            this.on("render", this.renderDashboardCharts, this);
            this.on("close", this.closeDashboardCharts, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        },

        renderDashboardCharts: function()
        {
            this.buildDashboardCharts();
            this.displayDashboardCharts();
        },

        buildDashboardCharts: function()
        {
            this.charts = [];
            this.charts.push(new DashboardChartView());
            this.charts.push(new PmcChartView());
        },

        displayDashboardCharts: function()
        {
            _.each(this.charts, function(chartView)
            {
                chartView.render();
                this.ui.chartsContainer.append(chartView.el);
            }, this);
        },

        closeDashboardCharts: function()
        {
            _.each(this.charts, function(chartView)
            {
                chartView.close();
            }, this);
        }

    };

    return PrimaryContainerView.extend(DashboardView);
});