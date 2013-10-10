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
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
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

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph", "onFirstRender");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for graph view";

            if (!options.dataParser)
                throw "dataParser is required for graph view";

            this.stateModel = options.stateModel;

            this.detailDataPromise = options.detailDataPromise;
            this.dataParser = options.dataParser;
            this.lastFilterPeriod = this.getInitialFilterPeriod();
            this.currentAxis = "time";
            this.selections = [];

            this.firstRender = true;

            this.repaintHeight = _.debounce(this.repaintHeight, 200);
        },

        initialEvents: function()
        {
            this.disabledSeries = [];
            this.model.off("change", this.render);
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
                this.createFlotGraph();
        },
        
        watchForModelChanges: function()
        {
            this.model.get("detailData").on("change:flatSamples", this.createFlotGraph, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.get("detailData").off("change:flatSamples", this.createFlotGraph, this);
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
            if (this.model.get("detailData") === null || !this.model.get("detailData").get("flatSamples"))
                return;
            
            this.$plot = this.$("#plot");
            this.drawPlot();
        },

        drawPlot: function()
        {
            var self = this;

            if (!this.allSeries)
            {
                this.allSeries = this.dataParser.getSeries();
            }

            this.dataParser.workoutTypeValueId = this.model.get("workoutTypeValueId");
            this.dataParser.setDisabledSeries(this.disabledSeries);

            var enabledSeries = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(enabledSeries);

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotCustomToolTip(self.allSeries, enabledSeries, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId"), self.currentAxis));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };
            
            this.flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler, this.currentAxis, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this.dataParser;
            this.flotOptions.filter = { enabled: this.lastFilterPeriod ? true : false, period: this.lastFilterPeriod };
            this.flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            this.flotOptions.grid.borderColor = "#9a9999";

            if (this.plot)
                this.unbindPlotEvents();

            this.$plot.css({ "min-height": 1, "min-width": 1 });

            if($.plot)
            {
                this.plot = $.plot(this.$plot, enabledSeries, this.flotOptions);
                this.bindToPlotEvents();
                this.highlightOrZoomToPreviousSelection();
            }

            this.setInitialToolbarSmoothing(this.lastFilterPeriod);

            
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
            this.graphToolbar = new GraphToolbarView({ dataParser: this.dataParser, model: this.model });

            this.graphToolbar.on("filterPeriodChanged", this.applyFilter, this);
            this.graphToolbar.on("enableSeries", this.enableSeries, this);
            this.graphToolbar.on("disableSeries", this.disableSeries, this);
            this.graphToolbar.on("zoom", this.onToolbarZoom, this);
            this.graphToolbar.on("reset", this.resetZoom, this);
            this.graphToolbar.on("enableTimeAxis", this.enableTimeAxis, this);
            this.graphToolbar.on("enableDistanceAxis", this.enableDistanceAxis, this);

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

            if (!this.plot.getSelection() && this.plot.hasMultiSelection())
            {
                var lastSelection = this.plot.getLastMultiSelection();
                this.plot.hideActiveSelections();
                this.plot.setSelection(lastSelection.ranges, true);
                if (this.plot.zoomToSelection(true)) 
                { 
                    this.plot.clearSelection(true);
                    this.zoomed = true;
                    this.graphToolbar.onGraphZoomed();
                }
                else
                    this.plot.unhideActiveSelections();
            }
            else if (this.plot.getSelection())
            {
                this.zoomed = true;
                if(this.plot.zoomToSelection())
                {
                    this.graphToolbar.onGraphZoomed();
                }
                else
                {
                    this.zoomed = false;
                }
            }
            else
            {
                this.zoomed = false;
            }
        },
        
        resetZoom: function()
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphZoomReset", "eventLabel": "" });

            this.plot.resetZoom();

            this.highlightPreviousSelection();

            this.zoomed = false;
        },

        highlightPreviousSelection: function()
        {
            if (this.selectedWorkoutStatsForRange)
            {
                var from;
                var to;

                if (this.currentAxis === "time")
                {
                    from = this.selectedWorkoutStatsForRange.get("begin");
                    to = this.selectedWorkoutStatsForRange.get("end");
                }
                else if (this.currentAxis === "distance")
                {
                    from = this.selectedWorkoutStatsForRange.get("plotSelectionFrom");
                    to = this.selectedWorkoutStatsForRange.get("plotSelectionTo");
                }
                else
                    throw "GraphView: invalid X Axis type: " + this.currentAxis;

                var ranges =
                {
                    xaxis:
                    {
                        from: from,
                        to: to 
                    }
                };
                this.plot.setSelection(ranges, true);
            }
            else
            {
                this.plot.hideActiveSelections();
                this.plot.unhideActiveSelections();
            }
        },

        highlightOrZoomToPreviousSelection: function()
        {
            if(this.selectedWorkoutStatsForRange)
            {
                this.highlightPreviousSelection();

                if (this.zoomed)
                {
                    this.zoomGraph();
                }
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
            
            var startOffsetMs;
            var endOffsetMs;
            
            if (this.currentAxis === "time")
            {
                startOffsetMs = Math.round(plotSelectionFrom);
                endOffsetMs = Math.round(plotSelectionTo);
            }
            else
            {
                startOffsetMs = this.dataParser.getMsOffsetFromDistance(plotSelectionFrom);
                endOffsetMs = this.dataParser.getMsOffsetFromDistance(plotSelectionTo);
            }

            this.selectedWorkoutStatsForRange = new WorkoutStatsForRange({ workoutId: this.model.id, begin: startOffsetMs, end: endOffsetMs, plotSelectionFrom: plotSelectionFrom, plotSelectionTo: plotSelectionTo, name: "Selection" });

            var options =
            {
                displayStats: true
            };

            this.stateModel.get("ranges").reset([this.selectedWorkoutStatsForRange], options);
        },

        onPlotUnSelected: function()
        {
            if (!this.zoomed)
            {
                this.stateModel.get("ranges").reset();
            }
        },

        onPlotHover: function(event, pos, item)
        {
            this.stateModel.set("hover", pos.x);
        },
       
        onMouseLeave: function(event)
        {
            this.stateModel.set("hover", null);
        },

        enableSeries: function(series)
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesEnabled", "eventLabel": series });
            
            if(_.contains(this.disabledSeries, series))
            {
                this.disabledSeries = _.without(this.disabledSeries, series);
                this.drawPlot();
            }
        },
        
        disableSeries: function(series)
        {
            if (!this.plot)
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "graphSeriesDisabled", "eventLabel": series });

            if (!_.contains(this.disabledSeries, series))
            {
                this.disabledSeries.push(series);
                this.drawPlot();
            }
        },

        enableTimeAxis: function ()
        {
            if (this.currentAxis === "time")
                return;

            this.selectedWorkoutStatsForRange = null;
            this.onUnSelectAll();
            this.stateModel.get("ranges").reset();
            this.resetZoom();
            this.graphToolbar.hideZoomButton();
            this.currentAxis = "time";
            this.dataParser.setXAxis("time");
            this.drawPlot();
        },
        
        enableDistanceAxis: function ()
        {
            if (this.currentAxis === "distance")
                return;

            this.selectedWorkoutStatsForRange = null;
            this.onUnSelectAll();
            this.stateModel.get("ranges").reset();
            this.resetZoom();
            this.graphToolbar.hideZoomButton();
            this.currentAxis = "distance";
            this.dataParser.setXAxis("distance");
            this.drawPlot();
        },

        watchForControllerEvents: function()
        {
            this.listenTo(this.stateModel.get("ranges"), "add", _.bind(this._onRangeAdded, this));
            this.listenTo(this.stateModel.get("ranges"), "remove", _.bind(this._onRangeRemoved, this));
            this.listenTo(this.stateModel.get("ranges"), "reset", _.bind(this._onRangesReset, this));
        },

        _onRangeAdded: function(range, ranges, options)
        {
            var selection = this.findGraphSelection(range.get("begin"), range.get("end"), options.dataType);
            if (!selection)
            {
                this.plot.clearSelection();
                selection = this.createGraphSelection(range, options);
                this.addSelectionToGraph(selection);

                if (this.selectedWorkoutStatsForRange)
                {
                    this.stateModel.get("ranges").remove(this.selectedWorkoutStatsForRange);
                    this.selectedWorkoutStatsForRange = null;
                }
            }
        },

        _onRangeRemoved: function(range, ranges, options)
        {
            var selection = this.findGraphSelection(range.get("begin"), range.get("end"), options.dataType);
            if(selection)
            {
                this.removeSelectionFromGraph(selection);
                this.selections = _.without(this.selections, selection);
            }
        },

        _onRangesReset: function(ranges, options)
        {
            var self = this;

            _.each(this.selections, this.removeSelectionFromGraph, this);
            this.selections = [];
            ranges.each(function(range)
            {
                self._onRangeAdded(range, ranges, options);
            });
        },

        findGraphSelection: function(begin, end, dataType)
        {
            return _.find(this.selections, function(selection)
            {
                return selection.begin === begin && selection.end === end && selection.dataType === dataType;
            });
        },

        createGraphSelection: function(workoutStatsForRange, options)
        {
            var selection =
            {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end"),
                dataType: options.dataType
            };

            return selection;
        },

        addSelectionToGraph: function (selection)
        {
            var from = selection.begin;
            var to = selection.end;
            
            if (this.currentAxis === "distance")
            {
                from = this.dataParser.getDistanceFromMsOffset(from);
                to = this.dataParser.getDistanceFromMsOffset(to);
            }

            selection.selection = this.plot.addMultiSelection({ xaxis: { from: from, to: to } }, { dataType: selection.dataType });
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
        }

    });
});
