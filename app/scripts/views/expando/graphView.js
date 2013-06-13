﻿define(
[
    "underscore",
    "TP",
    "utilities/charting/dataParser",
    "models/workoutStatsForRange",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/jquery.flot.zoom",
    "utilities/charting/jquery.flot.multiselection",
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
],
function(
    _,
    TP,
    DataParser,
    WorkoutStatsForRange,
    getDefaultFlotOptions,
    flotCustomToolTip,
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

            this.detailDataPromise = options.detailDataPromise;

            this.lastFilterPeriod = 0;
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

            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser = new DataParser();
            this.dataParser.loadData(flatSamples);
            this.overlayGraphToolbar();
            this.createFlotGraph();
        },

        createFlotGraph: function()
        {
            if (this.model.get("detailData") === null || !this.model.get("detailData").get("flatSamples"))
                return;
            
            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);

            this.$plot = this.$("#plot");
            if (!this.$plot.height())
            {
                this.$plot.height(365);
            }
            this.drawPlot();
        },

        drawPlot: function()
        {
            var self = this;
            
            this.dataParser.setDisabledSeries(this.disabledSeries);

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotCustomToolTip(series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId")));
                self.updateToolTipPosition($tooltipEl);
            };
            
            this.flotOptions = getDefaultFlotOptions(onHoverHandler);

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this.dataParser;
            this.flotOptions.filter = { enabled: this.lastFilterPeriod ? true : false, period: this.lastFilterPeriod };

            if (this.plot)
                this.unbindPlotEvents();
            
            this.plot = $.plot(this.$plot, series, this.flotOptions);
            this.bindToPlotEvents();
        },

        updateToolTipPosition: function($tooltipEl)
        {
            var canvasWidth = this.plot.width();
            var canvasHeight = this.plot.height();
            var canvasLocation = this.plot.offset();
            var tooltipWidth = $tooltipEl.width();
            var tooltipHeight = $tooltipEl.height();
            var tooltipLocation = $tooltipEl.offset();
            var canvasBottom = canvasLocation.top + canvasHeight;

            if (tooltipLocation.top + tooltipHeight > canvasBottom)
            {
                var tooltipTop = tooltipLocation.top - tooltipHeight + 60;
                if (tooltipTop + tooltipHeight > (canvasBottom + 20))
                {
                    tooltipTop = (canvasBottom - tooltipHeight) + 20;
                }

                $tooltipEl.css("top", tooltipTop + "px");
                $tooltipEl.addClass("bottom");
            }
            else
            {
                $tooltipEl.removeClass("bottom");
            }
            

            if (tooltipLocation.left + tooltipWidth > canvasLocation.left + canvasWidth - 30)
            {
                $tooltipEl.css("left", tooltipLocation.left - tooltipWidth - 40 + "px");
                $tooltipEl.removeClass("right").addClass("left");
            }
            else
            {
                $tooltipEl.removeClass("left").addClass("right");
            }

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

            this.zoomed = true;

            if (this.plot.zoomToSelection())
            {
                this.graphToolbar.onGraphZoomed();
            } else
            {
                this.zoomed = false;
            }
        },
        
        resetZoom: function()
        {
            if (!this.plot)
                return;

            this.plot.resetZoom();

            if (this.selectedWorkoutStatsForRange)
            {
                var ranges = {
                    xaxis: {
                        from: this.selectedWorkoutStatsForRange.get("begin"),
                        to: this.selectedWorkoutStatsForRange.get("end")
                    }
                };
                this.plot.setSelection(ranges, true);
            }

            this.zoomed = false;
        },
        
        applyFilter: function(period)
        {
            if (!this.plot)
                return;

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
        }

    });
});