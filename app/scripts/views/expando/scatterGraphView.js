define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "models/workoutStatsForRange",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.tooltip",
    "utilities/charting/jquery.flot.selection",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/flotToolTipPositioner",
    "utilities/charting/flotUtils",
    "utilities/charting/jquery.flot.zoom",
    "utilities/charting/jquery.flot.multiselection",
    "utilities/charting/chartColors",
    "utilities/charting/findOrderedArrayIndexByValue",
    "views/expando/scatterGraphToolbarView",
    "hbs!templates/views/expando/scatterGraphTemplate"
],
function(
    $,
    _,
    setImmediate,
    TP,
    WorkoutStatsForRange,
    defaultFlotOptions,
    flotToolTip,
    flotSelection,
    FlotCustomToolTip,
    toolTipPositioner,
    FlotUtils,
    flotZoom,
    flotMultiSelection,
    chartColors,
    findOrderedArrayIndexByValue,
    ScatterGraphToolbarView,
    graphTemplate
    )
{
    return TP.ItemView.extend(
    {
        className: "graphContainer expandoScatterGraphPod",

        template:
        {
            type: "handlebars",
            template: graphTemplate
        },

        modelEvents: {},

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph", "onFirstRender");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for graph view";

            this.stateModel = options.stateModel;

            this.detailDataPromise = options.detailDataPromise;
            this.selections = [];

            this.firstRender = true;

            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._onAvailableDataChannels, this));
            this.drawPlot = _.debounce(this.drawPlot, 500);

        },

        onRender: function()
        {
            var self = this;

            if (this.firstRender)
            {
                this.firstRender = false;

                this.watchForModelChanges();
                this.watchForControllerEvents();

                setImmediate(function()
                {
                    self.detailDataPromise.then(self.onFirstRender);
                });
            }
            else
            {
                this.createFlotGraph();
            }
        },

        watchForModelChanges: function()
        {
            this.listenTo(this.model.get("detailData"), "loaded:flatSamples", _.bind(this.drawPlot, this));
        },

        onFirstRender: function()
        {
            if (this.model.get("detailData") === null || !this.model.get("detailData").get("flatSamples"))
                return;
            this.setInitialXYAxis();
            this.overlayGraphToolbar();
            this.createFlotGraph();
        },

        setInitialXYAxis: function()
        {
            var availableChannels = this._getAvailableDataChannels();
            this.currentXAxis = availableChannels[0];
            this.currentYAxis = availableChannels[1];
        },

        createFlotGraph: function()
        {
            this.$plot = this.$("#scatterPlot");
            this.drawPlot();
        },

        drawPlot: function()
        {
            this.$el.removeClass("noData");

            if (this.model.get("detailData") === null || !this.model.get("detailData").get("flatSamples"))
            {
                this.$el.addClass("noData");
                this.trigger("noData");
                return;
            }

            var self = this;
            if (!this.allSeries)
            {
                this.allSeries = this._getGraphData().getSeries();
            }

            this._getGraphData().workoutTypeValueId = this.model.get("workoutTypeValueId");
            this._getGraphData().setDisabledSeries(this.model.get("detailData").get("disabledDataChannels"));

            var enabledSeries = this._getGraphData().getSeriesForAxes(this.currentXAxis, this.currentYAxis);

            if(!enabledSeries.length)
            {
                this.$el.addClass("noData");
                this.trigger("noData");
                return;
            }

            var yaxes = this._getGraphData().getYAxes(enabledSeries);

            // override default behavior of graphing for right power only.
            if(enabledSeries[0].label === 'RightPower')
            {
                enabledSeries[0].lines.show = false;
                delete enabledSeries[0].dashes;
            }
            enabledSeries[0].color = "#3c7fc4";
            enabledSeries[0].name = "primarySeries";

            var rangesSeries = this._createSeriesFromRanges(enabledSeries[0]);

            rangesSeries.push(enabledSeries[0]);
            rangesSeries.push(this._createAverageSeries(enabledSeries[0], this.currentXAxis, this.currentYAxis));

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(FlotCustomToolTip.buildScatterGraphToolTip(self.allSeries, rangesSeries, flotItem, self.model.get("workoutTypeValueId"), self.currentXAxis));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };

            this.flotOptions = defaultFlotOptions.getPointOptions(onHoverHandler, this.currentXAxis, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.selection.color = chartColors.chartPrimarySelection;
            this.flotOptions.highlightColor = "#000000";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            this.flotOptions.grid.borderColor = "#9A9999";

            if($.plot)
            {
                this.plot = $.plot(this.$plot, rangesSeries, this.flotOptions);
            }

            this.trigger("hasData");
        },

        overlayGraphToolbar: function()
        {
            var params =
            {
                model: this.model,
                stateModel: this.stateModel,
                xaxis: this.currentXAxis,
                yaxis: this.currentYAxis
            };
            this.graphToolbar = new ScatterGraphToolbarView(params);
            this.listenTo(this.graphToolbar, "scatterGraph:axisChange", _.bind(this._onChangeXYAxis, this));
            this.$("#scatterGraphToolbar").append(this.graphToolbar.render().$el);
        },

        _onChangeXYAxis: function(data)
        {
            if(data.axis === "x")
            {
                this.currentXAxis = data.series;
            }
            else
            {
                this.currentYAxis = data.series;
            }
            this._onSeriesChanged();
        },

        _onSeriesChanged: function()
        {
            if (!this.plot)
                return;
            this.drawPlot();
        },

        _onAvailableDataChannels: function(model)
        {
            var availableChannels = this._getAvailableDataChannels();

            if(!_.contains(availableChannels, this.currentXAxis))
            {
                this.currentXAxis = availableChannels[0];
            }
            if(!_.contains(availableChannels, this.currentYAxis))
            {
                this.currentYAxis = availableChannels[0];
            }

            this.graphToolbar.xaxis = this.currentXAxis;
            this.graphToolbar.yaxis = this.currentYAxis;
            this.graphToolbar.render();

            this._onSeriesChanged();
        },

        _getAvailableDataChannels: function()
        {
            var availableChannels = this.model.get("detailData").get("availableDataChannels");
            return _.without(availableChannels, "MillisecondOffset");
        },

        watchForControllerEvents: function()
        {
            this.listenTo(this.stateModel.get("ranges"), "add", _.bind(this._onRangeChange, this));
            this.listenTo(this.stateModel.get("ranges"), "remove", _.bind(this._onRangeChange, this));
            this.listenTo(this.stateModel.get("ranges"), "reset", _.bind(this._onRangeChange, this));
            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._onRangeChange, this));
        },

        _createSeriesFromRanges: function(enabledSeries)
        {
            var rangesSeries = [];
            var primaryRange = this.stateModel.get("primaryRange");
            var ranges = this.stateModel.get("ranges");
            var seriesCount = 0;

            if(primaryRange && primaryRange.getState().get('isFocused'))
            {
                this._createRange(enabledSeries, primaryRange, rangesSeries, seriesCount++, "#0000FF");
            }

            if(ranges && ranges.length > 0)
            {
                ranges.each(function(range)
                {
                    this._createRange(enabledSeries, range, rangesSeries, seriesCount++, "#FF0000");
                }, this);
            }

            return rangesSeries;
        },

        _createRange: function(enabledSeries, range, rangesSeries, seriesCount, color)
        {
            var copiedSeries = _.clone(enabledSeries);
            var begin = this._getGraphData().sampleData.indexOf("time", range.get("begin"));
            var end = this._getGraphData().sampleData.indexOf("time", range.get("end"));

            copiedSeries.data = [];

            for(var i = begin; i <= end; i++)
            {
                copiedSeries.data.push(_.clone(enabledSeries.data[i]));
                enabledSeries.data[i] = null;
            }
            copiedSeries.name = "series" + seriesCount;
            copiedSeries.color = color;
            rangesSeries.push(copiedSeries);
        },

        _onRangeChange: function()
        {
            this._onSeriesChanged();
        },

        _createAverageSeries: function(enabledSeries, xaxis, yaxis)
        {
            var avgS = _.clone(enabledSeries);
            var data = this._getGraphData().averageStats[xaxis + yaxis];
            avgS.data = [ [ data["xaxis"], data["yaxis"] ] ];

            avgS.color = "#FF0000";
            avgS.name = "averageSeries";

            _.extend(avgS, FlotUtils.createBullseye(4));

            return avgS;
        },

        _getGraphData: function()
        {
            return this.model.get("detailData").graphData;
        }

    });
});

