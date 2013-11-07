define(
[
    "underscore",
    "TP",
    "models/workoutStatsForRange",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.tooltip",
    "utilities/charting/jquery.flot.selection",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/flotToolTipPositioner",
    "utilities/charting/jquery.flot.zoom",
    "utilities/charting/jquery.flot.multiselection",
    "utilities/charting/chartColors",
    "views/expando/scatterGraphToolbarView",
    "hbs!templates/views/expando/scatterGraphTemplate"
],
function(
    _,
    TP,
    WorkoutStatsForRange,
    defaultFlotOptions,
    flotToolTip,
    flotSelection,
    FlotCustomToolTip,
    toolTipPositioner,
    flotZoom,
    flotMultiSelection,
    chartColors,
    ScatterGraphToolbarView,
    graphTemplate
    )
{
    return TP.ItemView.extend(
    {
        className: "graphContainer expandoGraphPod",

        template:
        {
            type: "handlebars",
            template: graphTemplate
        },

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph", "onFirstRender");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for graph view";

            this.stateModel = options.stateModel;

            this.detailDataPromise = options.detailDataPromise;
            this.selections = [];

            this.firstRender = true;

            this.repaintHeight = _.debounce(this.repaintHeight, 200);

            this.listenTo(this.model.get("detailData"), "change:disabledDataChannels", _.bind(this._onSeriesChanged, this));
            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._onSeriesChanged, this));
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
            this.listenTo(this.model.get("detailData"), "change:flatSamples", _.bind(this.createFlotGraph, this));
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
            var availableChannels = this.model.get("detailData").get("availableDataChannels");
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

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(FlotCustomToolTip.buildScatterGraphToolTip(enabledSeries, enabledSeries, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId"), self.currentXAxis));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };

            this.flotOptions = defaultFlotOptions.getPointOptions(onHoverHandler, this.currentXAxis.toLowerCase(), this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.selection.color = chartColors.chartPrimarySelection;
            this.flotOptions.highlightColor = "#000000";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            this.flotOptions.grid.borderColor = "#9A9999";
            // override default behavior of graphing for right power only.
            if(enabledSeries[0].label === 'RightPower')
            {
                enabledSeries[0].lines.show = false;
                delete enabledSeries[0].dashes;
            }
            enabledSeries[0].color = "#D9DA0E";

            if($.plot)
            {
                this.plot = $.plot(this.$plot, enabledSeries, this.flotOptions);
                this._restoreSelection();
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

        _setSelectionToRange: function(range, preventEvent, options)
        {
            var from;
            var to;

            if(!this.plot) return;

            if((range && range !== this.zoomRange) || (options && options.force))
            {

                if (this.currentXAxis === "time")
                {
                    from = range.get("begin");
                    to = range.get("end");
                }
                else if (this.currentXAxis === "distance")
                {
                    from = this._getGraphData().getDistanceFromMsOffset(range.get("begin"));
                    to = this._getGraphData().getDistanceFromMsOffset(range.get("end"));
                }
                else
                {
                    // TODO: potentially add other series types here
                }

                this.plot.setSelection({ xaxis: { from: from, to: to } }, preventEvent);

            }
            else
            {
                this.plot.clearSelection(preventEvent);
            }
        },

        _restoreSelection: function()
        {
            this._setSelectionToRange(this.stateModel.get("primaryRange"), true);
            this._applyRanges();
            if (this.plot)
            {
                this.plot.triggerRedrawOverlay();
            }
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

        watchForControllerEvents: function()
        {
            this.listenTo(this.stateModel.get("ranges"), "add", _.bind(this._onRangeAdded, this));
            this.listenTo(this.stateModel.get("ranges"), "remove", _.bind(this._onRangeRemoved, this));
            this.listenTo(this.stateModel.get("ranges"), "reset", _.bind(this._onRangesReset, this));
            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._onPrimaryRangeChange, this));
        },

        _onRangeAdded: function(range, ranges, options)
        {
            this._addRange(range);
        },

        _onRangeRemoved: function(range, ranges, options)
        {
            var selection = this.findGraphSelection(range.get("begin"), range.get("end"));
            if(selection)
            {
                this.removeSelectionFromGraph(selection);
                this.selections = _.without(this.selections, selection);
            }
        },

        _onRangesReset: function(ranges, options)
        {
            this._applyRanges();
        },

        _onPrimaryRangeChange: function(stateModel, range, options)
        {
            this._setSelectionToRange(range, true);
        },

        _applyRanges: function()
        {
            _.each(this.selections, this.removeSelectionFromGraph, this);
            this.selections = [];
            this.stateModel.get("ranges").each(this._addRange, this);
        },

        _addRange: function(range)
        {
            var selection = this.findGraphSelection(range.get("begin"), range.get("end"));
            if (!selection)
            {
                selection = this.createGraphSelection(range);
                this.addSelectionToGraph(selection);
            }
        },

        findGraphSelection: function(begin, end)
        {
            return _.find(this.selections, function(selection)
            {
                return selection.begin === begin && selection.end === end;
            });
        },

        createGraphSelection: function(workoutStatsForRange, options)
        {
            var selection =
            {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end")
            };

            return selection;
        },

        addSelectionToGraph: function (selection)
        {
            var from = selection.begin;
            var to = selection.end;

            if (this.currentAxis === "distance")
            {
                from = this._getGraphData().getDistanceFromMsOffset(from);
                to = this._getGraphData().getDistanceFromMsOffset(to);
            }

            selection.selection = this.plot.addMultiSelection({ xaxis: { from: from, to: to } });
            this.selections.push(selection);
        },

        removeSelectionFromGraph: function(selection)
        {
            this.plot.clearMultiSelection(selection.selection);
        },

        onUnSelectAll: function()
        {
            _.each(this.selections, function(selection)
            {
                this.removeSelectionFromGraph(selection);
            }, this);
            this.selections = [];
        },

        stashHeight: function(offsetRatio)
        {
            this.offsetRatio = offsetRatio;
        },

        _getGraphData: function()
        {
            return this.model.get("detailData").graphData;
        }

    });
});

