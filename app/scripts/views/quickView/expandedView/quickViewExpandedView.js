define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/jquery.flot.zoom",
    "hbs!templates/views/quickView/quickViewExpandedView"
],
function (TP, DataParser, getDefaultFlotOptions, flotCustomToolTip, flotZoom, expandedViewTemplate)
{

    var expandedViewBase =
    {
        className: "QVExpandedView",

        template:
        {
            type: "handlebars",
            template: expandedViewTemplate
        },
        
        onClose: function()
        {
            this.collapse();
        },
        
        collapse: function()
        {
            this.$el.parent().hide();

            if (this.resetButton)
                this.resetButton.remove();

            if (this.splineButton)
                this.splineButton.remove();

            if (this.toolTip)
                this.toolTip.remove();
        },

        initialize: function(options)
        {
            _.bindAll(this, "onModelFetched");
            this.prefetchConfig = options.prefetchConfig;
        },
        
        onRender: function()
        {
            var self = this;

            this.watchForModelChanges();

            this.$el.addClass("waiting");

            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").fetch();
            }

            // if we already have it in memory, render it
            if (this.model.get("detailData") !== null && this.model.get("detailData").attributes.flatSamples !== null)
            {
                this.onModelFetched();
            }
            
            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
        },

        watchForModelChanges: function ()
        {
            this.model.on("change:detailData", this.render, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.off("change:detailData", this.render, this);
        },
        
        onModelFetched: function ()
        {
            var self = this;

            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function () { self.createFlotGraphOnContainer(); });
        },

        createFlotGraphOnContainer: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;

            if (!this.dataParser)
            {
                this.dataParser = new DataParser();
                this.dataParser.loadData(flatSamples);
            }

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            this.flotOptions = getDefaultFlotOptions(series);

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this.dataParser;

            this.createFlotPlot(series);
        },
        
        createFlotPlot: function(data, options)
        {
            $.plot(this.$("#expandoGraphContainer"), data, typeof options !== "undefined" ? options : this.flotOptions);
        }
    };

    return TP.ItemView.extend(expandedViewBase);
});