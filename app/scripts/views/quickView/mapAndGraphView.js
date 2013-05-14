define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/mapping/mapUtils",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function(
    TP,
    DataParser,
    getDefaultFlotOptions,
    MapUtils,
    workoutTypes,
    workoutQuickViewMapAndGraphTemplate)
{

    var mapAndGraphViewBase =
    {
        className: "mapAndGraph",

        showThrobbers: true,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        initialize: function(options)
        {
            _.bindAll(this, "onModelFetched");

            this.dataParser = new DataParser();
            this.map = null;
            this.graph = null;

            if (!options.prefetchConfig)
                throw "Prefetch config is required for map and graph view";

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

        watchForModelChanges: function()
        {
            this.model.on("change:detailData", this.render, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.off("change:detailData", this.render, this);
        },

        onModelFetched: function()
        {
            var self = this;
            
            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function() { self.createAndDisplayMapAndGraph(); });
        },

        createAndDisplayMapAndGraph: function()
        {
            this.parseData();
            this.createAndShowGraph();

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#quickViewMap")[0]);

            MapUtils.setMapData(this.map, this.dataParser.getLatLonArray());
            MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser, 10);
        },

        parseData: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;
            this.dataParser.loadData(flatSamples);
        },

        createAndShowGraph: function()
        {
            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            var flotOptions = getDefaultFlotOptions(series);

            flotOptions.yaxes = yaxes;

            $.plot(this.$("#quickViewGraph"), series, flotOptions);
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
