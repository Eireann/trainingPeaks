﻿define(
[
    "underscore",
    "setImmediate",
    "TP",
    "framework/dataManager",
    "utilities/charting/flotToolTipPositioner",
    "views/userConfirmationView",
    "hbs!templates/views/dashboard/dashboardChart",
    "hbs!templates/views/charts/chartTooltip",
    "hbs!templates/views/confirmationViews/closeChartsConfirmationView"
],
function(
    _,
    setImmediate,
    TP,
    DataManager,
    toolTipPositioner,
    UserConfirmationView,
    podTemplate,
    tooltipTemplate,
    closeChartsConfirmationTemplate
    )
{
    var DashboardPodView = TP.ItemView.extend({

        className: "dashboardChart",

        template: {
            type: "handlebars",
            template: podTemplate
        },

        modelEvents: {},

        initialize: function(options)
        {

            if(!this.model)
            {
                throw "Dashboard Chart requires a settings model";
            }

            if(this.model.template)
            {
                this.template = this.model.template;
            }

            _.bindAll(this, "_onHoverToolTip", "_renderFlotChart", "waitingOff");

            //trigger redraw instead of dashboardDatesChange
            this.listenTo(this.model, "dashboardDatesChange", _.bind(this._onDashboardReset, this));
            this.listenTo(this.model, "dataManagerReset", _.bind(this._onDashboardReset, this));
            this.on("render", this._renderChartAfterRender, this);

            this.once("render", this._bindPlotClick, this);
            this._setChartCssClass();
        },

        ui:
        {
            chartContainer: ".chartContainer",
            chartTitle: ".chartTitle"
        },

        events:
        {
            "mousedown .settings": "_onSettingsClicked",
            "mousedown .expand": "_onExpandClicked",
            "mousedown .collapse": "_onExpandClicked",
            "mousedown .close": "_onCloseClicked"
        },

        serializeData: function()
        {
            var data = DashboardPodView.__super__.serializeData.apply(this, arguments);
            data.title = this._podTitle();
            return data;
        },

        _podTitle: function()
        {
            return this.model.get("title") || _.result(this.model, "defaultTitle");
        },

        _bindPlotClick: function()
        {
            this.ui.chartContainer.bind("plotclick", _.bind(this._onPlotClick, this));
        },

        _renderChartAfterRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self._renderChart();
            });
        },

        _renderChart: function()
        {
            this.waitingOn();
            this.model.buildChart().done(this._renderFlotChart).always(this.waitingOff);
        },

        _onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this.model.buildTooltipData(flotItem) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
            this.$currentToolTip = $tooltipEl;
        },

        _hideToolTip: function()
        {
            if(this.$currentToolTip)
            {
                this.$currentToolTip.remove();
            } 
        },

        _renderFlotChart: function(chartOptions)
        {

            this.$(".chartTitle").text(this._podTitle());
            if(!chartOptions)
            {
                this.$el.addClass("noData");
                this.$(".xaxisLabel").text("");
                this.$(".yaxisLabel").text("");
            }
            else
            {
                this.$el.removeClass("noData");
                if ($.plot)
                {
                    if(chartOptions.flotOptions && chartOptions.flotOptions.tooltipOpts)
                    {
                        chartOptions.flotOptions.tooltipOpts.onHover = this._onHoverToolTip;
                    }

                    this.plot = $.plot(this.ui.chartContainer, chartOptions.dataSeries, chartOptions.flotOptions);

                    var xaxisOpts = chartOptions.flotOptions.xaxis;
                    this.$(".xaxisLabel").text(xaxisOpts && xaxisOpts.label || "");

                    var yaxisOpts = chartOptions.flotOptions.yaxis;
                    var yaxesOpts = chartOptions.flotOptions.yaxes;
                    if (yaxisOpts)
                    {
                        this.$(".yaxisLabel.left").text(yaxisOpts && yaxisOpts.label || "");
                    }
                    else if (yaxesOpts)
                    {
                        this.$(".yaxisLabel.left").text(yaxesOpts && yaxesOpts[0] && yaxesOpts[0].label || "");
                        this.$(".yaxisLabel.right").text(yaxesOpts && yaxesOpts[1] && yaxesOpts[1].label || "");
                    }

                }
            }
        },

        _onPlotClick: function(event, position, item)
        {
            var onClickView = this.model.createItemDetailView(event, position, item);
            if(onClickView)
            {
                onClickView.render();
            }
        },

        _onSettingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            this._disableDrag();
            e.preventDefault();

            this._keepSettingsButtonVisible();

            var offset = $(e.currentTarget).offset();
            var windowWidth = $(window).width();

            var direction = (windowWidth - offset.left) > 450 ? "right" : "left";
            var icon = this.$(".settings");

            this.chartSettings = this.model.createChartSettingsView(); 

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

            this.chartSettings.on("close", this._onChartSettingsClose, this);
        },

        _onChartSettingsClose: function()
        {
            this._allowSettingsButtonToHide();
            this._enableDrag();
            this._renderChart();
        },

        _keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        _allowSettingsButtonToHide: function()
        {
            this.$el.removeClass("menuOpen");
        },

        _onExpandClicked: function()
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
                this._popOut();
            }
            else if(this._previousPosition)
            {
                this._popIn();
            }

        },

        _popOut: function()
        {
            this._disableDrag();
            var $chartContainer = this.ui.chartContainer;
            this._previousPosition = {
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

        _popIn: function()
        {
            var $chartContainer = this.ui.chartContainer;
            $chartContainer.toggleClass('invisible');
            this.$el.appendTo(this.chartsContainer).animate(this._previousPosition, 200, function(){ $chartContainer.toggleClass('invisible'); });
            this.closeModal();
            this._previousPosition = null;
            this._enableDrag();
            this.trigger('popIn');
        },

        setupModalOverlay: function()
        {
            this.createOverlay({ onOverlayClick: this.expandClicked });
            this.$overlay.css("z-index", this.$el.css("z-index") - 1);
            this.enableEscapeKey();
            this.closeOnRouteChange(this.expandClicked);
        },

        _onCloseClicked: function()
        {
            this.discardConfirmation = new UserConfirmationView({ template: closeChartsConfirmationTemplate });
            this.discardConfirmation.render();
            this.discardConfirmation.on("userConfirmed", this.onDiscardChangesConfirmed, this);
        },

        onDiscardChangesConfirmed: function()
        {
            this.model.destroy();
        },

        onEscapeKey: function(e)
        {
            if (e.which === 27)
                this._onExpandClicked();
        },

        _disableDrag: function()
        {
            if(this.$el.data("uiDraggable"))
            {
                this.$el.draggable("disable");
            } 
        },

        _enableDrag: function()
        {
            if(this.$el.data("uiDraggable"))
            {
                this.$el.draggable("enable");
            }
        },

        onClose: function()
        {
            this._hideToolTip();
        },

        _setChartCssClass: function()
        {
            var className = this.model.getChartName().replace(/[^a-zA-Z]/g,"");
            className = className.substring(0, 1).toLowerCase() + className.substring(1);
            this.$el.addClass(className); 
        },

        _onDashboardReset: function()
        {
            this._renderChart();
        }

    });

    return DashboardPodView;
});
