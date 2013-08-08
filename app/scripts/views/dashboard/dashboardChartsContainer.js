define(
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

        // use grid for gridster compatible row and column positioning, or use packery for simple 'float left' positioning
        useGrid: false,
        usePackery: true,

        template:
        {
            type: "handlebars",
            template: dashboardContainerTemplate
        },

        ui:
        {
            chartsContainer: "#chartsContainer"
        },

        initialize: function(options)
        {
            this.model = options && options.model ? options.model : theMarsApp.user;
            this.charts = [];
            this.on("close", this.closeDashboardCharts, this);
            this.on("user:loaded", this.onUserLoaded, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);

            if(!this.$el.packery)
            {
                this.usePackery = false;
            }

            if(!this.$el.gridster)
            {
                this.useGrid = false;
            }
        },

        renderDashboardCharts: function()
        {
            this.cleanupSettingsOrder(this.model.get("settings.dashboard.pods"));
            if(this.useGrid)
            {
                this.setChartGridPositions();
            }
            this.buildDashboardCharts();
            this.displayDashboardCharts();
            this.initGridLayout();
        },

        setChartGridPositions: function()
        {
            // if the first one has saved position, assume that they've all been setup?
            if(this.model.get("settings.dashboard.pods.0.row") && this.model.get("settings.dashboard.pods.0.column"))
            {
                return;
            }

            // else calculate
            var column = 1;
            var row = 1;
            var maxColumns = 4;

            _.each(this.model.get("settings.dashboard.pods"), function(podSettings, index)
            {
                var colspan = podSettings.chartType === 32 ? 2 : 1;

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
            _.each(this.model.get("settings.dashboard.pods"), function(podSettings, index)
            {
                // add some stuff to pod settings that we may not want to persist
                podSettings = _.extend({}, podSettings, {useGrid: this.useGrid, usePackery: this.usePackery, settingsModel: theMarsApp.user });

                var chartView = dashboardChartBuilder.buildChartView(podSettings.chartType, podSettings);
                this.charts.push(chartView);
                chartView.on("remove", this.onChartRemove, this);
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
                chartView.off("remove", this.onChartRemove, this);
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
            if(this.usePackery)
            {
                this.initPackery();
            }
            else if(this.useGrid)
            {
                this.initGridster();
            }
        },

        initGridster: function()
        {
            _.bindAll(this, "onDragStop");
            if(this.ui.chartsContainer.gridster)
            {
                this.ui.chartsContainer.gridster({
                    widget_margins: [10, 10],
                    widget_base_dimensions: [300, 300],
                    widget_selector: ".dashboardChart",
                    extra_rows: 2,
                    autogenerate_stylesheet: true,
                    min_cols: 4,
                    max_cols: 4,
                    draggable: {
                        stop: this.onDragStop
                    }
                });
            }
        },

        onDragStop: function()
        {
            var gridster = this.ui.chartsContainer.data("gridster");
        },

        initPackery: function()
        {

            if(this.packery)
            {
                this.packery.destroy();
                this.packery = null;
            }

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
            var orderedSettings = [];
            _.each(this.packery.getItemElements(), function(element, newIndex)
            {
                var oldIndex = $(element).attr("data-index");
                var setting = this.model.get("settings.dashboard.pods." + oldIndex);
                orderedSettings.push(setting);
            }, this);
            this.syncChartSettingsOrder(orderedSettings);
        },

        onChartRemove: function()
        {
            this.initPackery();
            var oldOrderedSettings = this.model.get("settings.dashboard.pods");
            this.syncChartSettingsOrder(oldOrderedSettings);
        },

        syncChartSettingsOrder: function(orderedSettings)
        {
            var newCharts = [];
            var newSettings = [];
            _.each(orderedSettings, function(chartSetting, index)
            {
                // lookup chart by it's original index
                var chartView = this.findChartByIndex(chartSetting.index);
                if(!chartView.isClosed)
                {
                    newSettings.push(chartSetting);
                    newCharts.push(chartView);
                }
            }, this);

            this.cleanupSettingsOrder(newSettings);

            _.each(newSettings, function(setting, index)
            {
                var chartView = newCharts[index];
                chartView.setSettingsIndex(index);
            });

            this.charts = newCharts;
            this.model.set("settings.dashboard.pods", newSettings, { silent: true});
            this.model.save();
        },

        cleanupSettingsOrder: function(orderedSettings)
        {
            _.each(orderedSettings, function(setting, index)
            {
                setting.index = index;
            });

        },

        findChartByIndex: function(index)
        {
            var chart = _.find(this.charts, function(chart)
            {
                return chart.index === index;
            });

            if(!chart)
            {
                throw "Unable to find chart by index = " + index;
            }

            return chart;
        },

        onDashboardDatesChange: function()
        {
            _.each(this.charts, function(chartView)
            {
                chartView.onDashboardDatesChange();
            });
        },

        onLibraryAnimateComplete: function()
        {
            this.resizeContainer();
            if(this.usePackery)
            {
                this.packery.layout();
            }
        }


    };

    return PrimaryContainerView.extend(DashboardView);
});