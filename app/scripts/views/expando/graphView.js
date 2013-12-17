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
    "utilities/charting/jquery.flot.zoom",
    "utilities/charting/jquery.flot.multiselection",
    "utilities/charting/chartColors",
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
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

        events: {
            "mouseleave #plot": "onMouseLeave"
        },

        modelEvents: {},

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph", "onFirstRender");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for graph view";

            this.stateModel = options.stateModel;

            this.detailDataPromise = options.detailDataPromise;
            this.lastFilterPeriod = this.getInitialFilterPeriod();
            this.currentAxis = "time";
            this.selections = [];

            this.firstRender = true;

            this.listenTo(this.model.get("detailData"), "change", _.bind(this._onSeriesChanged, this));
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.resetZoom, this));
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
            this.listenTo(this.model.get("detailData"), "loaded:flatSamples", _.bind(this.createFlotGraph, this));
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
            this.$plot = this.$("#plot");
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
                $tooltipEl.html(FlotCustomToolTip.buildGraphToolTip(self.allSeries, enabledSeries, flotItem, self.model.get("workoutTypeValueId"), self.currentAxis));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };

            this.flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler, this.currentAxis, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.selection.color = chartColors.chartPrimarySelection;
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this._getGraphData();
            this.flotOptions.filter = { enabled: this.lastFilterPeriod ? true : false, period: this.lastFilterPeriod };
            this.flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            this.flotOptions.grid.borderColor = "#9a9999";

            if (this.plot)
                this.unbindPlotEvents();

            if($.plot)
            {
                this.plot = $.plot(this.$plot, enabledSeries, this.flotOptions);
                this.bindToPlotEvents();
                this._restoreSelection();
            }

            this.setInitialToolbarSmoothing(this.lastFilterPeriod);

            this.trigger("hasData");
        },

        getInitialFilterPeriod: function()
        {
            if (this.hasOwnProperty("lastFilterPeriod"))
                return this.lastFilterPeriod;
            else if (this.model.get("workoutTypeValueId") === TP.utils.workout.types.getIdByName("Swim"))
                return 0;
            else
                return 5;
        },

        setInitialToolbarSmoothing: function(period)
        {
            this.graphToolbar.setFilterPeriod(period);
        },

        overlayGraphToolbar: function()
        {
            this.graphToolbar = new GraphToolbarView({ dataParser: this._getGraphData(), model: this.model, stateModel: this.stateModel });

            this.listenTo(this.graphToolbar, "filterPeriodChanged", _.bind(this.applyFilter, this));

            this.listenTo(this.graphToolbar, "zoom", _.bind(this.onToolbarZoom, this));
            this.listenTo(this.graphToolbar, "reset", _.bind(this.resetZoom, this));
            this.listenTo(this.graphToolbar, "enableTimeAxis", _.bind(this.enableTimeAxis, this));
            this.listenTo(this.graphToolbar, "enableDistanceAxis", _.bind(this.enableDistanceAxis, this));

            this.$("#graphToolbar").append(this.graphToolbar.render().$el);
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

        resetZoom: function()
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphZoomReset", "eventLabel": "" });

            this.plot.resetZoom();
            this.zoomRange = null;
            this._restoreSelection();
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

        applyFilter: function(period)
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSmoothingApplied", "eventLabel": "" });

            this.lastFilterPeriod = period;
            this.plot.setFilter(period);
        },

        bindToPlotEvents: function()
        {
            _.bindAll(this, "onPlotSelected", "onPlotUnSelected", "onPlotHover");
            var plotPlaceHolder = this.plot.getPlaceholder();

            plotPlaceHolder.bind("plotselected", this.onPlotSelected);
            plotPlaceHolder.bind("plotunselected", this.onPlotUnSelected);
            plotPlaceHolder.bind("plothover", this.onPlotHover);

            this.on("close", this.unbindPlotEvents, this);
        },

        unbindPlotEvents: function()
        {
            var plotPlaceHolder = this.plot.getPlaceholder();
            plotPlaceHolder.unbind("plotselected", this.onPlotSelected);
            plotPlaceHolder.unbind("plotunselected", this.onPlotUnSelected);
            plotPlaceHolder.unbind("plothover", this.onPlotHover);
        },

        onPlotSelected: function()
        {
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                _.bind(this.handlePlotSelected, this)
            );
        },

        handlePlotSelected: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSelection", "eventLabel": "" });

            var plotSelectionFrom = this.plot.getSelection().xaxis.from;
            var plotSelectionTo = this.plot.getSelection().xaxis.to;
            var msOffsets = this._findStartAndEndOffsetOfSelection(plotSelectionFrom, plotSelectionTo);
            var range = new WorkoutStatsForRange({ workoutId: this.model.id, begin: msOffsets.start, end: msOffsets.end, name: "Selection" });
            range.getState().set("temporary", true);
            this.stateModel.set("primaryRange", range);
        },

        _findStartAndEndOffsetOfSelection: function(plotSelectionFrom, plotSelectionTo)
        {

            var startOffsetMs;
            var endOffsetMs;

            if (this.currentAxis === "time")
            {
                startOffsetMs = Math.floor(plotSelectionFrom);
                endOffsetMs = Math.ceil(plotSelectionTo);
            }
            else
            {
                startOffsetMs = this._getGraphData().getMsOffsetFromDistance(plotSelectionFrom);
                endOffsetMs = this._getGraphData().getMsOffsetFromDistance(plotSelectionTo);
            }

            // snap to end if selection is within 1 pixel
            var lastSampleOffset = this._getGraphData().getMsOffsetOfLastSample(); 
            var widthOfOnePixelInMs = this._getMSWidthOfOnePlotPixel();
            if(lastSampleOffset - endOffsetMs <= widthOfOnePixelInMs)
            {
                endOffsetMs = lastSampleOffset;
            }

            return {
                start: startOffsetMs,
                end: endOffsetMs
            };
        },

        _getMSWidthOfOnePlotPixel: function() 
        {
            return this.plot.getXAxes()[0].c2p(1);
        },

        onPlotUnSelected: function()
        {
            this.stateModel.set("primaryRange", this.zoomRange || null);
        },

        onPlotHover: function(event, pos, item)
        {
            var graphData = this._getGraphData();
            var index = graphData.sampleData.indexOf(graphData.xaxis, pos.x);
            var offset = graphData.sampleData.get("time", index);
            this.stateModel.set("hover", offset);
        },

        onMouseLeave: function(event)
        {
            this.stateModel.set("hover", null);
        },

        _onSeriesChanged: function(model)
        {
            if(_.intersection(["disabledDataChannels", "availableDataChannels", "channelCuts"], _.keys(model.changed)).length)
            {
                this.drawPlot();
            }
        },

        enableTimeAxis: function ()
        {
            if (this.currentAxis === "time")
                return;

//             this.onUnSelectAll();
//             this.stateModel.get("ranges").set([]);
//             this.resetZoom();
//             this.graphToolbar.hideZoomButton();
            this.currentAxis = "time";
            this._getGraphData().setXAxis("time");
            this.drawPlot();
        },

        enableDistanceAxis: function ()
        {
            if (this.currentAxis === "distance")
                return;

            // this.onUnSelectAll();
            // this.stateModel.get("ranges").set([]);
            // this.resetZoom();
            // this.graphToolbar.hideZoomButton();
            this.currentAxis = "distance";
            this._getGraphData().setXAxis("distance");
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
