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
        className: "graphContainer",

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

            this.detailDataPromise = options.detailDataPromise;
            this.dataParser = options.dataParser;
            this.lastFilterPeriod = this.getInitialFilterPeriod();
            this.selections = [];

            this.firstRender = true;
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
                this.watchForControllerResize();

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
            this.model.get("detailData").on("change:flatSamples.samples", this.createFlotGraph, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.get("detailData").off("change:flatSamples.samples", this.createFlotGraph, this);
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
            this.$plot.height(this.getDesiredPlotHeight());
            this.drawPlot();
        },

        drawPlot: function()
        {
            var self = this;

            if (!this.allSeries)
            {
                this.allSeries = this.dataParser.getSeries();
            }

            this.dataParser.setDisabledSeries(this.disabledSeries);

            var enabledSeries = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(enabledSeries);

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotCustomToolTip(self.allSeries, enabledSeries, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId")));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };
            
            this.flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler);

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this.dataParser;
            this.flotOptions.filter = { enabled: this.lastFilterPeriod ? true : false, period: this.lastFilterPeriod };

            if (this.plot)
                this.unbindPlotEvents();

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
            {
                return this.lastFilterPeriod;
            } else if (this.model.get("workoutTypeValueId") === TP.utils.workout.types.getIdByName("Swim"))
            {
                return 0;
            } else
            {
                return 5;
            }
        },

        setInitialToolbarSmoothing: function(period)
        {
            this.graphToolbar.setFilterPeriod(period);
        },

        overlayGraphToolbar: function()
        {
            this.graphToolbar = new GraphToolbarView({ dataParser: this.dataParser });

            this.graphToolbar.on("filterPeriodChanged", this.applyFilter, this);
            this.graphToolbar.on("enableSeries", this.enableSeries, this);
            this.graphToolbar.on("disableSeries", this.disableSeries, this);
            this.graphToolbar.on("zoom", this.zoomGraph, this);
            this.graphToolbar.on("reset", this.resetZoom, this);

            this.$("#graphToolbar").append(this.graphToolbar.render().$el);
        },

        zoomGraph: function()
        {
            if (!this.plot)
                return;
            
            TP.analytics("send", "event", "expando", "graphZoomClicked");

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
            else if (this.plot.getSelection() && this.plot.zoomToSelection())
            {
                this.zoomed = true;
                this.graphToolbar.onGraphZoomed();
            }
            else
                this.zoomed = false;
        },
        
        resetZoom: function()
        {
            if (!this.plot)
                return;

            TP.analytics("send", "event", "expando", "graphZoomReset");

            this.plot.resetZoom();

            this.highlightPreviousSelection();

            this.zoomed = false;
        },

        highlightPreviousSelection: function()
        {
            if (this.selectedWorkoutStatsForRange)
            {
                var ranges = {
                    xaxis: {
                        from: this.selectedWorkoutStatsForRange.get("begin"),
                        to: this.selectedWorkoutStatsForRange.get("end")
                    }
                };
                this.plot.setSelection(ranges, true);
            } else
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

            TP.analytics("send", "event", "expando", "graphSmoothingApplied");

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
            TP.analytics("send", "event", "expando", "graphSelection");

            var startOffsetMs = Math.round(this.plot.getSelection().xaxis.from);
            var endOffsetMs = Math.round(this.plot.getSelection().xaxis.to);
            this.selectedWorkoutStatsForRange = new WorkoutStatsForRange({ workoutId: this.model.id, begin: startOffsetMs, end: endOffsetMs, name: "Selection" });
            var options = {};
            options.addToSelection = true;
            options.displayStats = true;
            this.trigger("unselectall");
            this.trigger("rangeselected", this.selectedWorkoutStatsForRange, options, this);
        },

        onPlotUnSelected: function()
        {
            if (!this.zoomed)
            {
                this.trigger("unselectall");
            }
        },

        onPlotHover: function(event, pos, item)
        {
            var options = {
                msOffset: pos.x,
                selected: false
            };

            this.trigger("graphhover", options);
        },
       
        onMouseLeave: function(event)
        {
            this.trigger("graphleave");
        },

        enableSeries: function(series)
        {
            if (!this.plot)
                return;

            TP.analytics("send", "event", "expando", "graphSeriesEnabled", series);
            
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

            TP.analytics("send", "event", "expando", "graphSeriesDisabled", series);

            if (!_.contains(this.disabledSeries, series))
            {
                this.disabledSeries.push(series);
                this.drawPlot();
            }
        },

        watchForControllerEvents: function()
        {
            this.on("controller:rangeselected", this.onRangeSelected, this);
            this.on("controller:unselectall", this.onUnSelectAll, this);
            this.on("close", this.stopWatchingControllerEvents, this);
        },

        stopWatchingControllerEvents: function()
        {
            this.off("controller:rangeselected", this.onRangeSelected, this);
        },

        onRangeSelected: function(workoutStatsForRange, options, triggeringView)
        {
            if (triggeringView === this || !options)
                return;

            var selection;
            if (options.removeFromSelection)
            {
                selection = this.findGraphSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"), options.dataType);
                if(selection)
                {
                    this.removeSelectionFromGraph(selection);
                    this.selections = _.without(this.selections, selection);
                }
            }
            else if (options.addToSelection)
            {
                selection = this.findGraphSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"), options.dataType);
                if (!selection)
                {

                    this.plot.clearSelection();
                    selection = this.createGraphSelection(workoutStatsForRange, options);
                    this.addSelectionToGraph(selection);

                    if (this.selectedWorkoutStatsForRange)
                    {
                        var triggerOptions = {};
                        triggerOptions.removeFromSelection = true;
                        this.trigger("rangeselected", this.selectedWorkoutStatsForRange, triggerOptions, this);
                        this.selectedWorkoutStatsForRange = null;
                    }
                }
            }
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
            var sampleStartIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("begin"));
            var sampleEndIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("end"));

            var selection = {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end"),
                dataType: options.dataType
            };

            return selection;
        },

        addSelectionToGraph: function(selection)
        {
            selection.selection = this.plot.addMultiSelection({ xaxis: { from: selection.begin, to: selection.end }}, {dataType: selection.dataType });
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

        getDesiredPlotHeight: function()
        {
            if (this.graphHeight)
            {
                return this.graphHeight - 50;
            } else
            {
                return this.dataParser.hasLatLongData ? 365 : 565;
            }
        },

        watchForControllerResize: function ()
        {
            this.on("controller:resize", this.setViewSize, this);
            this.on("close", function ()
            {
                this.off("controller:resize", this.setViewSize, this);
            }, this);
        },

        setViewSize: function (containerHeight, containerWidth)
        {
            var bottomMargin = 10;
            var heightPercent = this.dataParser.hasLatLongData ? 0.50 : 0.8;
            var graphHeight = Math.floor((containerHeight - bottomMargin) * heightPercent);

            if (graphHeight < 225)
            {
                graphHeight = 225;
            }

            this.graphHeight = graphHeight;
            this.$el.closest("#expandoGraphRegion").height(graphHeight);

            var topPadding = 15;
            var toolbarHeight = 35;

            this.$el.height(graphHeight - topPadding);
            if (this.$plot)
            {
                this.$plot.height(graphHeight - topPadding - toolbarHeight);
            }
        }

    });
});