define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "framework/dataManager",
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
    DataManager,
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
        colspan: 1,
        chartType: 0,
        modelClass: TP.Model,
        today: moment().hour(0).format("YYYY-MM-DD"),

        attributes: function()
        {
            return {
                "data-sizey": 1,
                "data-sizex": this.colspan 
            };
        },

        setDefaultDateSettings: function(options)
        {
            var defaultDateOption = chartUtils.chartDateOptions.USE_GLOBAL_DATES.id;
            var defaultSettings = { startDate: null, endDate: null, quickDateSelectOption: defaultDateOption };
            var mergedSettings = _.extend(defaultSettings, this.model.get("dateOptions"));
            if(!mergedSettings.quickDateSelectOption)
            {
                mergedSettings.quickDateSelectOption = defaultDateOption;
            }
            this.model.set("dateOptions", mergedSettings, { silent: true });
        },

        initialize: function(options)
        {
            if(!this.model)
            {
                throw "Dashboard Chart requires a settings model";
            }

            _.bindAll(this, "onHoverToolTip");
            this.dataManager = options && options.dataManager ? options.dataManager : new DataManager();
            this.setDefaultSettings(options);
            this.setupDataModel(options);

            this.listenTo(this.model, "dashboardDatesChange", _.bind(this._onDashboardDatesChange, this));
            this.on("render", this.renderChartAfterRender, this);
        },

        setupDataModel: function(options)
        {

            this.onWaitStart();

            this.chartDataModel = new this.modelClass(null, null);

            this.bindDataModelEvents();

            this.fetchData();

            this.on("close", this.unbindDataModelEvents, this);
            this.on("close", function(){this.model.destroy();});
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
            var myDateOptions = this.model.get("dateOptions");
            var chartDateParameters = chartUtils.buildChartParameters(myDateOptions);
            var chartSettings = this.model.attributes;

            var mergedSettings = _.extend({}, 
                                          chartSettings, 
                                          { dateOptions: 
                                                {
                                                    startDate: chartDateParameters.startDate.format(TP.utils.datetime.shortDateFormat),
                                                    endDate: chartDateParameters.endDate.format(TP.utils.datetime.shortDateFormat)
                                                }
                                          });
            this.chartDataModel.set(mergedSettings);

            var self = this;
            this.waitingOn();
            this.dataManager.fetch(this.chartDataModel).done(function()
            {
                self.render();
            }).always(function(){self.waitingOff();});
        },

        ui:
        {
            chartContainer: ".chartContainer"
        },

        events:
        {
            "mousedown .settings": "settingsClicked",
            "mousedown .expand": "expandClicked",
            "mousedown .collapse": "expandClicked",
            "mousedown .close": "closeClicked"
        },

        getChartTitle: function()
        {
            return this.buildWorkoutTypesTitle(this.model.get("workoutTypeIds"));
        },

        buildWorkoutTypesTitle: function(workoutTypeIds)
        {

            var workoutTypeNames = [];

            if (!workoutTypeIds || !workoutTypeIds.length || workoutTypeIds.length === _.keys(TP.utils.workout.types.typesById).length)
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

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);
            return flotOptions;
        },

        onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this.buildTooltipData(flotItem) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
        },

        buildTooltipData: function(flotItem)
        {
            var tips = [];
            var item = this.chartDataModel.get("data")[flotItem.dataIndex];
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

            this.disableDrag();
            e.preventDefault();

            this.keepSettingsButtonVisible();

            var offset = $(e.currentTarget).offset();
            var windowWidth = $(window).width();

            var direction = (windowWidth - offset.left) > 450 ? "right" : "left";
            var icon = this.$(".settings");

            this.chartSettings = this.createChartSettingsView(); 

            this.chartSettings.setTomahawkDirection(direction);

            this.chartSettings.render();
            if (direction === "left")
            {
                this.chartSettings.right(offset.left - 15);
            } else
            {
                this.chartSettings.left(offset.left + $(e.currentTarget).width() + 15);
            }

            this.chartSettings.alignArrowTo(offset.top + ($(e.currentTarget).height() / 2));

            this.chartSettings.on("close", this.onChartSettingsClose, this);

            this.listenToChartSettingsEvents();
        },

        createChartSettingsView: function()
        {
            return new dashboardChartSettings({ model: this.model });
        },

        listenToChartSettingsEvents: function()
        {
            return;
        },

        stopListeningToChartSettingsEvents: function()
        {
            return;
        },

        onChartSettingsClose: function()
        {
            this.stopListeningToChartSettingsEvents();
            this.allowSettingsButtonToHide();
            this.enableDrag();
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
            return this.model.get(settingKey);
        },

        setSetting: function(settingKey, value, options)
        {
            return this.model.set(settingKey, value, options);
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
            this.disableDrag();
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

            // Can't use .hide() because the $chartContainer needs to remain in the layout
            // so Flot can internally calculate axis label widths
            $chartContainer.toggleClass('invisible');
            var self = this;
            this.$el.appendTo($("body")).animate(newPosition, 200, function(){ self.setupModalOverlay(); $chartContainer.toggleClass('invisible'); });
            this.trigger('popOut');
        },

        popIn: function()
        {
            var $chartContainer = this.ui.chartContainer;
            $chartContainer.toggleClass('invisible');
            this.$el.appendTo(this.chartsContainer).animate(this.previousPosition, 200, function(){ $chartContainer.toggleClass('invisible'); });
            this.closeModal();
            this.previousPosition = null;
            this.enableDrag();
            this.trigger('popIn');
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
            this.trigger("before:remove");
            this.close();
            this.trigger("remove");
        },

        onEscapeKey: function(e)
        {
            if (e.which === 27)
                this.expandClicked();
        },

        _onDashboardDatesChange: function()
        {
            if(Number(this.model.get("dateOptions.quickDateSelectOption")) === chartUtils.chartDateOptions.USE_GLOBAL_DATES.id)
            {
                this.fetchData();
            }
        },

        disableDrag: function()
        {
            if(this.$el.data("uiDraggable"))
            {
                this.$el.draggable("disable");
            } 
        },

        enableDrag: function()
        {
            if(this.$el.data("uiDraggable"))
            {
                this.$el.draggable("enable");
            }
        },

        setDefaultSettings: function(options)
        {
            this.setDefaultDateSettings(options);
        },

        serializeData: function()
        {
            var data = _.clone(this.model.attributes);
            data.title = this.getChartTitle();
            return data;
        }

    };


    return DashboardChartBase;
});
