define(
[
    "underscore",
    "TP",
    "utilities/charting/dataParser",
    "models/workoutStatsForRange",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/jquery.flot.zoom",
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
],
function(
    _,
    TP,
    DataParser,
    WorkoutStatsForRange,
    getDefaultFlotOptions,
    flotZoom,
    GraphToolbarView,
    graphTemplate
    )
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: graphTemplate
        },

        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph");

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map and graph view";

            this.detailDataPromise = options.detailDataPromise;

            //TODO refactor, this should be set by CSS classes (CSS calc?)
            this.$el.height(400);

            this.lastFilterPeriod = 0;
            this.selections = [];
        },

        initialEvents: function()
        {
            this.disabledSeries = [];
            this.model.off("change", this.render);
        },

        onRender: function()
        {
            var self = this;
            this.watchForModelChanges();
            this.watchForControllerEvents();
            setImmediate(function() { self.detailDataPromise.then(self.createFlotGraph); });
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

        createFlotGraph: function ()
        {
            if (this.model.get("detailData") === null || !this.model.get("detailData").get("flatSamples"))
                return;

            var flatSamples = this.model.get("detailData").get("flatSamples");

            this.dataParser = new DataParser();
            this.dataParser.loadData(flatSamples);

            this.overlayGraphToolbar();
            this.$plot = $("<div style='height:100%'></div>").appendTo(this.$el);

            this.drawPlot();
        },
        
        drawPlot: function()
        {
            this.dataParser.setDisabledSeries(this.disabledSeries);

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            this.flotOptions = getDefaultFlotOptions(series, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: false };
            this.flotOptions.zoom.dataParser = this.dataParser;
            this.flotOptions.zoom.resetButton = ".graphResetButton";
            this.flotOptions.filter = { enabled: this.lastFilterPeriod ? true : false, period: this.lastFilterPeriod };

            this.plot = $.plot(this.$plot, series, this.flotOptions);
            this.bindToPlotEvents();
        },
        
        overlayGraphToolbar: function()
        {
            var toolbar = new GraphToolbarView({ dataParser: this.dataParser });

            toolbar.on("filterPeriodChanged", this.applyFilter, this);
            toolbar.on("enableSeries", this.enableSeries, this);
            toolbar.on("disableSeries", this.disableSeries, this);

            this.$el.append(toolbar.render().$el);
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
            _.bindAll(this, "onPlotSelected");
            this.plot.getPlaceholder().bind("plotselected", this.onPlotSelected);
            this.on("close", this.unbindPlotEvents, this);
        },

        unbindPlotEvents: function()
        {
            this.plot.getPlaceholder().unbind("plotselected", this.onPlotSelected);
        },

        onPlotSelected: function()
        {
            var startOffsetMs = Math.round(this.plot.getSelection().xaxis.from);
            var endOffsetMs = Math.round(this.plot.getSelection().xaxis.to);
            var workoutStatsForRange = new WorkoutStatsForRange({ workoutId: this.model.id, begin: startOffsetMs, end: endOffsetMs, name: "Selection" });
            this.trigger("rangeselected", workoutStatsForRange);
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
            this.on("close", this.stopWatchingControllerEvents, this);
        },

        stopWatchingControllerEvents: function()
        {
            this.off("controller:rangeselected", this.onRangeSelected, this);
        },

        onRangeSelected: function (workoutStatsForRange)
        {

            if (workoutStatsForRange.removeFromSelection)
            {
                var selection = this.findGraphSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
                if(selection)
                {
                    this.removeSelectionFromGraph(selection);
                    this.selections = _.without(this.selections, selection);
                }
            } else if(workoutStatsForRange.addToSelection)
            {
                var selection = this.createGraphSelection(workoutStatsForRange);
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

        createGraphSelection: function(workoutStatsForRange)
        {
            var sampleStartIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("begin"));
            var sampleEndIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("end"));

            var selection = {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end")
            }

            return selection;
        },

        addSelectionToGraph: function(selection)
        {
            this.selections.push(selection);
            this.plot.setSelection({ xaxis: { from: selection.begin, to: selection.end }});
        },

        removeSelectionFromGraph: function(selection)
        {
            this.plot.clearSelection();
        }
    });
});