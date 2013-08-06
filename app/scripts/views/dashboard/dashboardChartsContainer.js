﻿define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "gridster",
    "TP",
    "utilities/charting/dashboardChartBuilder",
    "views/pageContainer/primaryContainerView",
    "hbs!templates/views/dashboard/dashboardChartsContainer"
],
function(
    _,
    jqueryDraggable,
    packery,
    gridster,
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
            this.setChartGridPositions();
            this.buildDashboardCharts();
            this.displayDashboardCharts();
            this.initGridLayout();
        },

        setChartGridPositions: function()
        {
            // if the first one has saved position, assume that they've all been setup?
            if(theMarsApp.user.get("settings.dashboard.pods.0.row") && theMarsApp.user.get("settings.dashboard.pods.0.column"))
            {
                return;
            }

            // else calculate
            var column = 1;
            var row = 1;
            var maxColumns = 4;

            _.each(theMarsApp.user.get("settings.dashboard.pods"), function(podSettings, index)
            {
                var colspan = podSettings.chartType == 32 ? 2 : 1;

                // will it fit on this row?
                if((column + colspan - 1) <= maxColumns)
                {
                    podSettings.column = column;
                    podSettings.row = row;
                    column+= colspan;
                } else {
                    row++;
                    column = 1;
                    podSettings.column = column;
                    podSettings.row = row;
                    column++;
                }

            }, this);
        },

        buildDashboardCharts: function()
        {
            this.charts = [];
            _.each(theMarsApp.user.get("settings.dashboard.pods"), function(podSettings, index)
            {
                var chartView = dashboardChartBuilder.buildChartView(podSettings.chartType, podSettings);
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

        initGridLayout: function()
        {
            //this.initPackery();
            this.initGridster();
        },

        initGridster: function()
        {
            _.bindAll(this, "onDragStop");
            if(this.ui.chartsContainer.gridster)
            {
                this.ui.chartsContainer.gridster({
                    widget_margins: [10, 10],
                    widget_base_dimensions: [400, 400],
                    widget_selector: ".dashboardChart",
                    extra_rows: 2,
                    autogenerate_stylesheet: true,
                    min_cols: 4,
                    max_cols: 5,
                    draggable: {
                        stop: this.onDragStop
                    }
                });
            }
        },

        onDragStop: function()
        {
            var gridster = this.ui.chartsContainer.data("gridster");
            console.log(gridster.serialize_changed());
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