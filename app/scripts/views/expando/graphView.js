define(
[
    "underscore",
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/jquery.flot.zoom",
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
],
function(
    _,
    TP,
    DataParser,
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

            this.flotOptions = getDefaultFlotOptions(series);

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
            var selectionStartMilliseconds = Math.round(this.plot.getXAxes()[0].min);
            var selectionEndMilliseconds = Math.round(this.plot.getXAxes()[0].max);
            var sampleStartIndex = this.dataParser.findIndexByMsOffset(selectionStartMilliseconds);
            var sampleEndIndex = this.dataParser.findIndexByMsOffset(selectionEndMilliseconds);
            this.trigger("plotselected", sampleStartIndex, sampleEndIndex);
        }


    });
});