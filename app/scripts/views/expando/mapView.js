define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/mapping/mapUtils",
    "hbs!templates/views/expando/mapTemplate"
],
function(
    TP,
    DataParser,
    MapUtils,
    mapTemplate
    )
{

    /*
    TODO:
    how many markers?
    how are the different tile url's related, and how do we pull in google?
    */

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: mapTemplate 
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


            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map and graph view";

            this.detailDataPromise = options.detailDataPromise;
        },

        onRender: function()
        {
            var self = this;
            this.watchForModelChanges();
            this.$el.addClass("waiting");
            setImmediate(function() { self.detailDataPromise.then(self.onModelFetched); });
        },

        watchForModelChanges: function()
        {
            this.model.on("change:detailData", this.onModelFetched, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.off("change:detailData", this.render, this);
        },

        onModelFetched: function()
        {
            this.$el.removeClass("waiting");
            this.createAndDisplayMap();
        },

        createAndDisplayMap: function()
        {
            this.parseData();

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#expandoMap")[0]);

            MapUtils.setMapData(this.map, this.dataParser.getLatLonArray());
            MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser);
        },

        parseData: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;
            this.dataParser.loadData(flatSamples);
        }

    });
});