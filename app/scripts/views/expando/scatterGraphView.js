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
    flotCustomToolTip,
    toolTipPositioner,
    flotZoom,
    flotMultiSelection,
    chartColors,
    GraphToolbarView,
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


        modelEvents: {},

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph", "onFirstRender");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for graph view";

            this.stateModel = options.stateModel;

            this.detailDataPromise = options.detailDataPromise;
            this.currentAxis = "time";
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

            this.overlayGraphToolbar();
            this.createFlotGraph();
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

            var enabledSeries = this._getGraphData().getSeries();

            if(!enabledSeries.length)
            {
                this.$el.addClass("noData");
                this.trigger("noData");
                return;
            }

            var yaxes = this._getGraphData().getYAxes(enabledSeries);

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotCustomToolTip(self.allSeries, enabledSeries, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId"), self.currentAxis));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };

            this.flotOptions = defaultFlotOptions.getPointOptions(onHoverHandler, this.currentAxis, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.selection.color = chartColors.chartPrimarySelection;
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            this.flotOptions.grid.borderColor = "#9a9999";

            if($.plot)
            {
                this.plot = $.plot(this.$plot, enabledSeries, this.flotOptions);
                this._restoreSelection();
            }

            this.trigger("hasData");
        },

        overlayGraphToolbar: function()
        {
            this.graphToolbar = new GraphToolbarView({ dataParser: this._getGraphData(), model: this.model, stateModel: this.stateModel });
            this.$("#scatterGraphToolbar").append(this.graphToolbar.render().$el);
        },

        onToolbarZoom: function()
        {
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                _.bind(this.zoomGraph, this)
            );
        },

        zoomGraph: function()
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphZoomClicked", "eventLabel": "" });

            this.zoomRange = this.stateModel.get("primaryRange");
            this._applyZoom();
        },

        _applyZoom: function()
        {
            if(!this.zoomRange)
            {
                return;
            }

            this._setSelectionToRange(this.zoomRange, true, { force: true });
            if (this.plot.zoomToSelection())
            {
                this.graphToolbar.onGraphZoomed();
            }
            else
            {
                this.zoomRange = null;
            }
            this._setSelectionToRange(this.stateModel.get("primaryRange"), true);
        },

        _setSelectionToRange: function(range, preventEvent, options)
        {
            var from;
            var to;

            if(!this.plot) return;

            if((range && range !== this.zoomRange) || (options && options.force))
            {

                if (this.currentAxis === "time")
                {
                    from = range.get("begin");
                    to = range.get("end");
                }
                else if (this.currentAxis === "distance")
                {
                    from = this._getGraphData().getDistanceFromMsOffset(range.get("begin"));
                    to = this._getGraphData().getDistanceFromMsOffset(range.get("end"));
                }
                else
                {
                    throw new Error("GraphView: invalid X Axis type: " + this.currentAxis);
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
            this._applyZoom();
            this._setSelectionToRange(this.stateModel.get("primaryRange"), true);
            this._applyRanges();
            if (this.plot)
            {
                this.plot.triggerRedrawOverlay();
            }
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

