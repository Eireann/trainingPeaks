define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "models/reporting/chartDataModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/flotToolTipPositioner",
    "utilities/workout/workoutTypes",
    "views/dashboard/chartUtils",
    "./dashboardChartSettings",
    "hbs!templates/views/charts/chartTooltip"
],
function(
    _,
    setImmediate,
    moment,
    TP,
    ChartDataModel,
    defaultFlotOptions,
    chartColors,
    toolTipPositioner,
    workoutTypes,
    chartUtils,
    dashboardChartSettings,
    tooltipTemplate
    )
{
    var DashboardChartBase = {
        tagName: "div",
        className: "dashboardChart",
        showThrobber: true,
        index: 0,
        column: 1,
        row: 1,
        colspan: 1,
        chartType: 0,
        modelClass: ChartDataModel,
        today: moment().hour(0).format("YYYY-MM-DD"),
        useGrid: false,

        attributes: function()
        {
            if(this.useGrid)
            {
                return {
                    "data-index": this.index,
                    "data-sizey": 1,
                    "data-sizex": this.colspan,
                    "data-col": this.column,
                    "data-row": this.row
                };
            } 
            else
            {
                return {
                    "data-index": this.index,
                    "data-sizey": 1,
                    "data-sizex": this.colspan 
                };
            }
        },

        buildDefaultOptions: function(options)
        {
            return _.extend({}, { index: 0, row: 0, column: 0, useGrid: false }, options);
        },

        setGridAttributes: function(options)
        {
            this.useGrid = options.useGrid;
            this.index = options.index;
            this.row = options.row;
            this.column = options.column;
            this.$el.attr(this.attributes());
        },

        setDefaultDateSettings: function(options)
        {
            var defaultDateOption = chartUtils.chartDateOptions.USE_GLOBAL_DATES.id;
            var defaultSettings = { startDate: null, endDate: null, quickDateSelectOption: defaultDateOption };
            var mergedSettings = _.extend(defaultSettings, this.getSetting("dateOptions"));
            if(!mergedSettings.quickDateSelectOption)
            {
                mergedSettings.quickDateSelectOption = defaultDateOption;
            }
            this.setSetting("dateOptions", mergedSettings, { silent: true })
        },

        initialize: function(options)
        {
            options = this.buildDefaultOptions(options);
            _.bindAll(this, "onHoverToolTip");
            this.setGridAttributes(options);
            this.setSettingsIndex(options.index);
            this.setupSettingsModel(options);
            this.setupViewModel(options);
            this.setupDataModel(options);
        },

        setupSettingsModel: function(options)
        {
            this.settingsModel = options && options.hasOwnProperty("settingsModel") ? options.settingsModel : theMarsApp.user;
            this.setDefaultDateSettings(options);
        },

        setupViewModel: function(options)
        {
            this.model = new TP.Model();
        },

        setupDataModel: function(options)
        {

            this.onWaitStart();

            this.chartDataModel = new this.modelClass(null, null);

            this.bindDataModelEvents();

            this.on("user:loaded", this.onUserLoaded, this);

            this.on("close", this.unbindDataModelEvents, this);
        },

        onUserLoaded: function()
        {
            this.on("render", this.renderChartAfterRender, this);
            this.fetchData();
        },

        bindDataModelEvents: function()
        {
            _.each(_.without(_.keys(this.modelEvents), "change"), function(eventName)
            {
                this.chartDataModel.on(eventName, this[this.modelEvents[eventName]], this);
            }, this);
        },

        unbindDataModelEvents: function()
        {
            _.each(_.without(_.keys(this.modelEvents), "change"), function(eventName)
            {
                this.chartDataModel.off(eventName, this[this.modelEvents[eventName]], this);
            }, this);

        },

        fetchData: function()
        {
            var myDateSettings = this.getSetting("dateOptions");
            var chartDateParameters = chartUtils.buildChartParameters(myDateSettings);
            this.chartDataModel.setParameters(chartDateParameters);

            var self = this;
            this.waitingOn();
            this.chartDataModel.fetch().done(function()
            {
                self.setChartTitle();
                self.render();
            }).always(function(){self.waitingOff();});
        },

        ui:
        {
            chartContainer: ".chartContainer"
        },

        events:
        {
            "click .settings": "settingsClicked",
            "click .expand": "expandClicked",
            "click .collapse": "expandClicked",
            "click .close": "closeClicked"
        },

        setChartTitle: function()
        {
            var workoutTypesTitle = this.buildWorkoutTypesTitle(this.chartDataModel.workoutTypeIds);
            this.model.set("title", workoutTypesTitle);
        },

        buildWorkoutTypesTitle: function(workoutTypeIds)
        {
            var workoutTypeNames = [];

            if (workoutTypeIds.length === _.keys(TP.utils.workout.types.typesById).length)
            {
                workoutTypeNames.push("All");
            } else
            {
                _.each(workoutTypeIds, function(item, index)
                {
                    var intItem = parseInt(item, 10);
                    var workoutType = intItem === 0 ? "All" : workoutTypes.getNameById(intItem);
                    if(workoutType !== "Unknown")
                    {
                        workoutTypeNames.push(workoutType); 
                    }

                }, this);
            }

            var types = workoutTypeNames.join(", ");
            if (!types)
            {
                types = "All";
            }
            return types;
        },

        renderChartAfterRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.renderChart();
            });
        },

        renderChart: function()
        {
            var chartPoints = this.buildFlotPoints(this.chartDataModel.get("data"));
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
        },
        
        buildFlotPoints: function(modelData)
        {
            var chartPoints = {};
            return chartPoints;
        },

        buildFlotDataSeries: function(chartPoints, chartColors)
        {
            var series = [];
            return series;
        },

        buildFlotChartOptions: function(TSBAxisRange)
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);
            return flotOptions;
        },

        onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this.buildTooltipData(flotItem.dataIndex) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
        },

        buildTooltipData: function(index)
        {
            var tips = [];
            var item = this.chartDataModel.get("data")[index];
            return tips;
        },

        renderFlotChart: function(dataSeries, flotOptions)
        {
            if ($.plot)
            {
                this.plot = $.plot(this.ui.chartContainer, dataSeries, flotOptions);
            }
        },

        settingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            e.preventDefault();

            this.keepSettingsButtonVisible();

            var offset = $(e.currentTarget).offset();
            var windowWidth = $(window).width();

            var direction = (windowWidth - offset.left) > 450 ? "right" : "left";
            var icon = this.$(".settings");
            this.chartSettings = new dashboardChartSettings({ model: this.settingsModel, direction: direction, index: this.index });

            this.chartSettings.render().top(offset.top - 25);
            this.chartSettings.setTomahawkDirection(direction);

            if (direction === "left")
            {
                this.chartSettings.right(offset.left - 15);
            } else
            {
                this.chartSettings.left(offset.left + $(e.currentTarget).width() + 15);
            }

            this.chartSettings.on("change:settings", this.onChartSettingsChange, this);
            this.chartSettings.on("close", this.allowSettingsButtonToHide, this);
        },

        onChartSettingsChange: function()
        {
            this.fetchData();
        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        allowSettingsButtonToHide: function()
        {
            this.$el.removeClass("menuOpen");
        },

        getSetting: function(settingKey)
        {
            return this.settingsModel.get(this.settingsKey + "." + settingKey);
        },

        setSetting: function(settingKey, value, options)
        {
            return this.settingsModel.set(this.settingsKey + "." + settingKey, value, options);
        },

        expandClicked: function()
        {
            this.$el.toggleClass("doubleWide");
            this.$el.toggleClass("fullScreen");          
            this.$el.toggleClass("expanded");

            if(!this.chartsContainer)
            {
                this.chartsContainer = this.$el.parent();
            }

            if(this.$el.is(".expanded"))
            {
                this.popOut();
            }
            else if(this.previousPosition)
            {
                this.popIn();
            }

        },

        popOut: function()
        {
                var $chartContainer = this.ui.chartContainer;
                this.previousPosition = {
                    top: this.$el.css("top"),
                    left: this.$el.css("left"),
                    bottom: "auto",
                    right: "auto"
                };

                var newPosition = {
                    top: "10px",
                    bottom: "20px",
                    left: "10px",
                    right: "10px"
                };

                $chartContainer.hide();
                var self = this;
                this.$el.appendTo($("body")).animate(newPosition, 200, function(){ self.setupModalOverlay(); $chartContainer.show(); });
        },

        popIn: function()
        {
            var $chartContainer = this.ui.chartContainer;
            $chartContainer.hide();
            this.$el.appendTo(this.chartsContainer).animate(this.previousPosition, 200, function(){ $chartContainer.show(); });
            this.closeModal();
            this.previousPosition = null;
        },

        setupModalOverlay: function()
        {
            this.createOverlay({ onOverlayClick: this.expandClicked });
            this.$overlay.css("z-index", this.$el.css("z-index") - 1);
            this.enableEscapeKey();
            this.closeOnRouteChange(this.expandClicked);
        },

        closeClicked: function()
        {
            this.close();
            this.trigger("remove");
        },

        onEscapeKey: function(e)
        {
            if (e.which === 27)
                this.expandClicked();
        },

        setSettingsIndex: function(index)
        {
            this.index = index;
            this.settingsKey = "settings.dashboard.pods." + this.index;
            this.$el.attr("data-index", index);
        },

        onDashboardDatesChange: function()
        {
            if(this.getSetting("dateOptions.quickDateSelectOption") === chartUtils.chartDateOptions.USE_GLOBAL_DATES.id)
            {
                this.fetchData();
            }
        }

    };


    return DashboardChartBase;
});