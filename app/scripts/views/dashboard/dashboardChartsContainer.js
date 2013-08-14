define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "gridster",
    "TP",
    "./dashboardChartBuilder",
    "views/pageContainer/primaryContainerView",
    "views/packeryCollectionView",
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
    PackeryCollectionView,
    dashboardContainerTemplate
    )
{
    var DashboardView = PrimaryContainerView.extend({
        template:
        {
            type: "handlebars",
            template: dashboardContainerTemplate
        },

        regions: {
            "chartsRegion": ".chartsRegion"
        },

        initialize: function(options)
        {
            DashboardView.__super__.initialize.apply(this, arguments);

            if(!this.model)
            {
                this.model = theMarsApp.user;
            }

            this._fakeCollection();

            this.packeryCollectionView = new PackeryCollectionView({
                itemView: _.bind(this.buildChartView, this),
                collection: this.collection
            });

            this.on("show", _.bind(this._showPackeryCollectionView, this));
        },

        buildChartView: function(options)
        {
            var model = options.model;
            return dashboardChartBuilder.buildChartView(model.get("chartType"), _.clone(model.attributes));
        },

        _fakeCollection: function()
        {
            var self = this;

            this.collection = new TP.Collection();
            _.each(this.model.get("settings.dashboard.pods"), function(podSettings)
            {
                self.collection.add(new TP.Model(podSettings));
            });
        },

        _showPackeryCollectionView: function()
        {
            this.chartsRegion.show(this.packeryCollectionView);
        }

    });

    return DashboardView;

    /*
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

        onShow: function()
        {
            var self = this;
            var chartView;

            function move(event, ui)
            {
                chartView.$el.offset(ui.offset);
                var position = chartView.$el.position();
                self.packery.itemDragMove(chartView.el,
                                          position.left + self.ui.chartsContainer.scrollLeft(),
                                          position.top + self.ui.chartsContainer.scrollTop());
            }

            function attach(event, ui)
            {
                if(ui.draggable.hasClass("chartTile"))
                {
                    var podSettings =
                    {
                        useGrid: this.useGrid,
                        usePackery: this.usePackery,
                        settingsModel: theMarsApp.user,
                        index: self.charts.length
                    };
                    chartView = dashboardChartBuilder.buildChartView(ui.draggable.data("ChartType"), podSettings);
                    chartView.render();
                    chartView.fetchData();
                    chartView.$el.addClass("hover");

                    // chartView.$el.attr("data-index", self.charts.length);
                    // chartView.index = self.charts.length;
                    self.model.set("settings.dashboard.pods." + self.charts.length + ".index", self.charts.length);
                    self.model.set("settings.dashboard.pods." + self.charts.length + ".chartType", ui.draggable.data("ChartType"));
                    self.charts.push(chartView);

                    self.ui.chartsContainer.append(chartView.$el);
                    chartView.$el.css({postion: "absolute"});
                    move(event, ui);

                    ui.helper.css('visibility', 'hidden');

                    self.packery.addItems(chartView.el);
                    self.packery.itemDragStart(chartView.el);
                    ui.draggable.on("drag", move);
                }
            }

            function detach(event, ui)
            {
                if(ui.draggable && ui.draggable.hasClass("chartTile"))
                {
                    ui.helper.css('visibility', 'visible');
                    chartView.$el.removeClass('hover');

                    self.charts = _.without(self.charts, chartView);

                    self.packery.remove(chartView.el);
                    self.packery.itemDragEnd(chartView.el);
                    ui.draggable.off("drag", move);
                }
            }
            
            function drop(event, ui)
            {
                if(ui.draggable.hasClass("chartTile"))
                {
                    chartView.$el.removeClass('hover');

                    self.packery.itemDragEnd(chartView.el);
                    ui.draggable.off("drag", move);
                    self.updateChartOrder();
                    self._addElementsToPackery(chartView.$el);
                }
            }

            this.$el.droppable(
            {
                over: attach, 
                out: detach,
                drop: drop
            });
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
                chartView.on("before:remove", this.onBeforeChartRemove, this);
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
                this._addElementsToPackery($charts);
            }
        },

        _addElementsToPackery: function($charts)
        {
            $charts.draggable({ containment: "#chartsContainer" });
            this.ui.chartsContainer.packery("bindUIDraggableEvents", $charts);
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

        onBeforeChartRemove: function()
        {
            this.scrollTop = this.ui.chartsContainer.scrollTop();
        },

        onChartRemove: function()
        {
            this.initPackery();
            this.ui.chartsContainer.scrollTop(this.scrollTop);
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
    */
});
