define(
[
    "TP",
    "leaflet",
    "utilities/charting/axesBaseConfig",
    "utilities/charting/highchartsBaseConfig",
    "utilities/charting/dataParser",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, Leaflet, axesBaseConfig, highchartsBaseConfig, dataParser, workoutTypes, workoutQuickViewMapAndGraphTemplate)
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

            this.axesConfig = {};
            _.extend(this.axesConfig, axesBaseConfig,
            {
                
            });

            this.chartConfig = {};
            _.extend(this.chartConfig, highchartsBaseConfig,
            {
                chart:
                {
                    alignTicks: true,
                    backgroundColor: "transparent",
                    height: 160,
                    resetZoomEnabled: false,
                    type: "line",
                    width: 620,
                    zoomType: null
                }
            });
            // turn off the default TP item view on change event ...
            delete this.modelEvents.change;

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

            var data = dataParser(flatSamples);

            this.seriesArray = data.seriesArray;
            this.latLonArray = data.latLonArray;
            this.minElevation = data.minElevation;
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
        
        createAndShowGraph: function(container)
        {
            var self = this;
            
            if (this.graph)
                this.graph.destroy();
            
            var orderedAxes = [];
            var i = 0;
        
            _.each(this.seriesArray, function(series)
            {
                var seriesAxis = self.axesConfig[series.name];

                if (series.name === "Elevation" && self.minElevation > 0)
                    seriesAxis.min = self.minElevation;
                
                series.yAxis = i++;
                orderedAxes.push(seriesAxis);
            });

            this.chartConfig.chart.renderTo = container;
            this.chartConfig.yAxis = orderedAxes;
            this.chartConfig.series = this.seriesArray;

            if (workoutTypes.getNameById(this.model.get("workoutTypeValueId")) === "Swim")
                this.chartConfig.plotOptions.line.gapSize = 0;

            this.graph = new Highcharts.StockChart(this.chartConfig);
        },
        
        setMapData: function()
        {
            if (this.latLonArray && this.latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(this.latLonArray, function (point)
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
