define(
[
    "underscore",
    "jqueryui/draggable",
    "TP",
    "views/pageContainer/primaryContainerView",
    "views/dashboard/dashboardChart",
    "views/dashboard/pmcChart",
    "hbs!templates/views/dashboard/dashboardChartsContainer"
],
function(
    _,
    jqueryDraggable,
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
            this.on("close", this.closeDashboardCharts, this);
            this.on("user:loaded", this.onUserLoaded, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        },

        renderDashboardCharts: function()
        {
            this.buildDashboardCharts();
            this.displayDashboardCharts();
            this.initPackery();
        },

        buildDashboardCharts: function()
        {
            this.charts = [];

            // LOOP OVER SETTINGS OBJECT
            // FOR EACH CHART IN USER DASHBOARD CONFIG:
            //  IF PMC
            this.charts.push(new PmcChartView());
            // IF ANY OTHER CHART
            this.charts.push(new DashboardChartView()); // MODIFY TO TAKE CHART TILE PARAMETER
            // LOOP
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
        },

        onUserLoaded: function()
        {
            this.renderDashboardCharts();
            _.each(this.charts, function(chartView)
            {
                chartView.trigger("user:loaded");
            }, this);
        },

        initPackery: function()
        {

            this.ui.chartsContainer.packery({
                itemSelector: ".dashboardChart",
                gutter: 10
            });

            var $charts = this.ui.chartsContainer.find(".dashboardChart");
            $charts.draggable({ containment: "#chartsContainer" });
            this.ui.chartsContainer.packery("bindUIDraggableEvents", $charts);
        }

    };

    return PrimaryContainerView.extend(DashboardView);
});