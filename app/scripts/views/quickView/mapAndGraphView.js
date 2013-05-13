define(
[
    "TP",
    "leaflet",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, Leaflet, DataParser, getDefaultFlotOptions, workoutTypes, workoutQuickViewMapAndGraphTemplate)
{
    var osmURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg";
    var cloudmadeURL = "http://b.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/1/256/{z}/{x}/{y}.png";
    var leafletURL = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
    
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
            this.createAndShowGraph("quickViewGraph");

            if (!this.map)
                this.createMapOnContainer("quickViewMap");

            this.setMapData();
        },

        parseData: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;
            this.dataParser.loadData(flatSamples);
        },

        createMapOnContainer: function(container)
        {
            var osmLayer = new L.TileLayer(osmURL);
            var cloudmadeLayer = new L.TileLayer(cloudmadeURL);
            var leafletLayer = new L.TileLayer(leafletURL);

            var mapConfig =
            {
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: true,
                layers: [osmLayer],
                center: new L.LatLng(40.012369, -105.132353),
                zoom: 8
            };

            var baseMaps =
            {
                "OSM": osmLayer,
                "Cloudmade": cloudmadeLayer,
                "Leaflet": leafletLayer
            };

            this.map = L.map(container, mapConfig);
            L.control.layers(baseMaps).addTo(this.map);
        },
        
        createAndShowGraph: function()
        {
            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            var flotOptions = getDefaultFlotOptions(series);

            flotOptions.yaxes = yaxes;

            $.plot($("#quickViewGraph"), series, flotOptions);
        },
        
        setMapData: function()
        {
            var latLonArray = this.dataParser.getLatLonArray();
            if (latLonArray && latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(latLonArray, function (point)
                {
                    if (point[0] && point[1])
                        leafletLatLongs.push(new L.LatLng(parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)));
                });

                var polyline = L.polyline(leafletLatLongs, { color: "red", smoothFactor: 1.0, opacity: 1, weight: 5 }).addTo(this.map);
                this.map.fitBounds(polyline.getBounds());
            }
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
