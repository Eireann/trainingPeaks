﻿define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "TP",
    "utilities/charting/dashboardChartBuilder",
    "views/pageContainer/primaryContainerView",
    "hbs!templates/views/dashboard/dashboardChartsContainer"
],
function(
    _,
    jqueryDraggable,
    packery,
    TP,
    dashboardChartBuilder,
    PrimaryContainerView,
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
            _.each(theMarsApp.user.get("settings.dashboard.pods"), function(podSettings, index)
            {
                var chartView = dashboardChartBuilder.buildChartView(podSettings.chartType, index, podSettings.title);
                this.charts.push(chartView);
                chartView.on("expand", this.onChartExpand, this);
                chartView.on("after:close", this.onChartClose, this);
            }, this);
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
                chartView.off("after:close", this.onChartClose, this);
                chartView.off("expand", this.onChartExpand, this);
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

            if(this.ui.chartsContainer.packery)
            {
                this.ui.chartsContainer.packery({
                    containerStyle: null,
                    itemSelector: ".dashboardChart",
                    rowHeight: 410,
                    columnWidth: 410,
                    gutter: 10
                });

                this.packery = this.ui.chartsContainer.data("packery");
                _.bindAll(this, "updateChartOrder");
                this.packery.on("dragItemPositioned", this.updateChartOrder);

                var $charts = this.ui.chartsContainer.find(".dashboardChart");
                $charts.draggable({ containment: "#chartsContainer" });
                this.ui.chartsContainer.packery("bindUIDraggableEvents", $charts);
            }
        },

        updateChartOrder: function()
        {
            var elements = this.packery.getItemElements();
            _.each(elements, function(element, podIndex) {
                var originalPodIndex = Number($(element).data("podindex"));
                var chart = this.charts[originalPodIndex];
                // NOT IMPLEMENTED YET UNTIL WE ARE ABLE TO SAVE SETTINGS
            }, this);
        },

        onChartClose: function()
        {
            this.packery.layout();
        },

        onChartExpand: function()
        {
            this.packery.layout();
        }

    };

    return PrimaryContainerView.extend(DashboardView);
});