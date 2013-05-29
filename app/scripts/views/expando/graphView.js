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
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        onRender: function()
        {
            var self = this;
            this.watchForModelChanges();
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

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            this.flotOptions = getDefaultFlotOptions(series, this.model.get("workoutTypeValueId"));

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: false };
            this.flotOptions.zoom.dataParser = this.dataParser;
            this.flotOptions.zoom.resetButton = ".graphResetButton";

            this.plot = $.plot(this.$el, series, this.flotOptions);

            this.bindToPlotEvents();
            this.overlayGraphToolbar();
        },
        
        overlayGraphToolbar: function()
        {
            var toolbar = new GraphToolbarView({ dataParser: this.dataParser });
            toolbar.on("filterPeriodChanged", this.applyFilter, this);
            this.$el.append(toolbar.render().$el);
        },
        
        applyFilter: function(period)
        {
            if (!this.plot)
                return;
            
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
        }
    });
});